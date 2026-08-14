import os
import re
import json
import urllib.parse
import time
from http.server import SimpleHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn
import socket

PORT = 8000
PUBLIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), 'organic-farm-website-template'))
DATA_FILE = os.path.join(PUBLIC_DIR, 'data', 'media.json')
GROWERS_FILE = os.path.join(PUBLIC_DIR, 'data', 'growers.json')
BLOGS_FILE = os.path.join(PUBLIC_DIR, 'data', 'blogs.json')

class CustomAPIRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/login':
            self.handle_login()
        elif self.path == '/api/upload':
            self.handle_upload()
        elif self.path == '/api/delete':
            self.handle_delete()
        elif self.path == '/api/grower/add':
            self.handle_grower_add()
        elif self.path == '/api/grower/delete':
            self.handle_grower_delete()
        elif self.path == '/api/blog/save':
            self.handle_blog_save()
        elif self.path == '/api/blog/delete':
            self.handle_blog_delete()
        else:
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"success": False, "message": "API Endpoint Not Found"}).encode('utf-8'))

    def handle_login(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        
        try:
            data = json.loads(body)
        except Exception:
            data = urllib.parse.parse_qs(body)
            data = {k: v[0] for k, v in data.items()}

        passcode = data.get('passcode')
        if passcode == 'mahima2026':
            self.send_json_response(200, {"success": True, "token": "mock-token-mahima-2026"})
        else:
            self.send_json_response(401, {"success": False, "message": "Invalid Passcode"})

    def handle_upload(self):
        content_type = self.headers.get('Content-Type', '')
        if 'multipart/form-data' not in content_type:
            self.send_json_response(400, {"success": False, "message": "Content-Type must be multipart/form-data"})
            return

        boundary_match = re.search(r'boundary=([^;]+)', content_type)
        if not boundary_match:
            self.send_json_response(400, {"success": False, "message": "No multipart boundary found"})
            return
        
        boundary = boundary_match.group(1).encode('utf-8')
        content_length = int(self.headers.get('Content-Length', 0))
        body_bytes = self.rfile.read(content_length)

        parts = body_bytes.split(b'--' + boundary)
        fields = {}
        file_data = None
        filename = None
        file_content_type = None

        for part in parts:
            if not part or part.strip() == b'' or part.strip() == b'--':
                continue
            
            if part.startswith(b'\r\n'):
                part = part[2:]
            if part.endswith(b'\r\n'):
                part = part[:-2]
            if part.endswith(b'--'):
                part = part[:-2]

            if b'\r\n\r\n' not in part:
                continue

            headers_part, content_part = part.split(b'\r\n\r\n', 1)
            headers_str = headers_part.decode('utf-8', errors='ignore')

            name_match = re.search(r'name="([^"]+)"', headers_str)
            filename_match = re.search(r'filename="([^"]+)"', headers_str)

            if filename_match:
                filename = filename_match.group(1)
                file_data = content_part
                content_type_match = re.search(r'Content-Type:\s*([^\r\n]+)', headers_str)
                file_content_type = content_type_match.group(1) if content_type_match else 'application/octet-stream'
            elif name_match:
                name = name_match.group(1)
                value = content_part.decode('utf-8', errors='ignore')
                fields[name] = value

        title = fields.get('title')
        media_type = fields.get('type')
        description = fields.get('description', '')
        category = fields.get('category', 'all')
        grower_id = fields.get('growerId', '')
        
        if not title or not media_type or not filename or not file_data:
            self.send_json_response(400, {"success": False, "message": "Missing file or required text fields (title, type)"})
            return

        safe_filename = "".join([c for c in filename if c.isalpha() or c.isdigit() or c in '._-']).strip()
        prefix = str(int(time.time()))
        safe_filename = f"{prefix}_{safe_filename}"

        folder_map = {
            'image': 'images',
            'pdf': 'pdfs',
            'video': 'videos'
        }
        subfolder = folder_map.get(media_type, 'images')
        upload_dir = os.path.join(PUBLIC_DIR, 'uploads', subfolder)
        os.makedirs(upload_dir, exist_ok=True)

        target_filepath = os.path.join(upload_dir, safe_filename)
        with open(target_filepath, 'wb') as f:
            f.write(file_data)

        try:
            if os.path.exists(DATA_FILE):
                with open(DATA_FILE, 'r', encoding='utf-8') as f:
                    media_list = json.load(f)
            else:
                media_list = []
        except Exception:
            media_list = []

        new_item = {
            "id": prefix,
            "title": title,
            "type": media_type,
            "description": description,
            "category": category,
            "filename": safe_filename,
            "url": f"uploads/{subfolder}/{safe_filename}",
            "date": time.strftime("%Y-%m-%d"),
            "growerId": grower_id
        }
        media_list.append(new_item)

        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(media_list, f, indent=4)

        self.send_json_response(200, {"success": True, "item": new_item})

    def handle_delete(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        
        try:
            data = json.loads(body)
        except Exception:
            self.send_json_response(400, {"success": False, "message": "Invalid JSON body"})
            return

        item_id = data.get('id')
        if not item_id:
            self.send_json_response(400, {"success": False, "message": "Missing item ID"})
            return

        if not os.path.exists(DATA_FILE):
            self.send_json_response(404, {"success": False, "message": "No media database found"})
            return

        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            media_list = json.load(f)

        item_to_delete = None
        for item in media_list:
            if item.get('id') == item_id:
                item_to_delete = item
                break

        if not item_to_delete:
            self.send_json_response(404, {"success": False, "message": "Item not found"})
            return

        file_rel_path = item_to_delete.get('url')
        file_abs_path = os.path.join(PUBLIC_DIR, file_rel_path)
        if os.path.exists(file_abs_path):
            try:
                os.remove(file_abs_path)
            except Exception as e:
                print(f"Could not delete file {file_abs_path}: {e}")

        media_list = [item for item in media_list if item.get('id') != item_id]
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(media_list, f, indent=4)

        self.send_json_response(200, {"success": True, "message": "Item deleted successfully"})

    def handle_grower_add(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        
        try:
            data = json.loads(body)
        except Exception:
            self.send_json_response(400, {"success": False, "message": "Invalid JSON body"})
            return

        name = data.get('name')
        location = data.get('location')
        acres = data.get('acres', '')
        phone = data.get('phone', '')
        crop = data.get('crop', '')
        details = data.get('details', '')

        if not name or not location:
            self.send_json_response(400, {"success": False, "message": "Missing required fields (name, location)"})
            return

        # Load database
        try:
            if os.path.exists(GROWERS_FILE):
                with open(GROWERS_FILE, 'r', encoding='utf-8') as f:
                    growers_list = json.load(f)
            else:
                growers_list = []
        except Exception:
            growers_list = []

        grower_id = "grower_" + str(int(time.time()))
        new_grower = {
            "id": grower_id,
            "name": name,
            "location": location,
            "acres": acres,
            "phone": phone,
            "crop": crop,
            "details": details
        }
        growers_list.append(new_grower)

        with open(GROWERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(growers_list, f, indent=4)

        self.send_json_response(200, {"success": True, "grower": new_grower})

    def handle_grower_delete(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        
        try:
            data = json.loads(body)
        except Exception:
            self.send_json_response(400, {"success": False, "message": "Invalid JSON body"})
            return

        grower_id = data.get('id')
        if not grower_id:
            self.send_json_response(400, {"success": False, "message": "Missing grower ID"})
            return

        if not os.path.exists(GROWERS_FILE):
            self.send_json_response(404, {"success": False, "message": "No growers database found"})
            return

        with open(GROWERS_FILE, 'r', encoding='utf-8') as f:
            growers_list = json.load(f)

        # Filter out the grower
        updated_growers = [g for g in growers_list if g.get('id') != grower_id]
        with open(GROWERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(updated_growers, f, indent=4)

        # Unlink associated media in media.json (setting growerId to empty string)
        if os.path.exists(DATA_FILE):
            try:
                with open(DATA_FILE, 'r', encoding='utf-8') as f:
                    media_list = json.load(f)
                
                for item in media_list:
                    if item.get('growerId') == grower_id:
                        item['growerId'] = ''
                
                with open(DATA_FILE, 'w', encoding='utf-8') as f:
                    json.dump(media_list, f, indent=4)
            except Exception as e:
                print(f"Could not unlink media for grower {grower_id}: {e}")

        self.send_json_response(200, {"success": True, "message": "Grower deleted successfully"})

    def handle_blog_save(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        
        try:
            data = json.loads(body)
        except Exception:
            self.send_json_response(400, {"success": False, "message": "Invalid JSON body"})
            return

        blog_id = data.get('id')
        title = data.get('title')
        content = data.get('content')
        category = data.get('category', 'General')
        author = data.get('author', 'Admin')
        image = data.get('image', '')
        read_time = data.get('readTime', '5 min')
        excerpt = data.get('excerpt', '')
        date = data.get('date')

        if not title or not content:
            self.send_json_response(400, {"success": False, "message": "Missing required fields (title, content)"})
            return

        # Load database
        try:
            if os.path.exists(BLOGS_FILE):
                with open(BLOGS_FILE, 'r', encoding='utf-8') as f:
                    blogs_list = json.load(f)
            else:
                blogs_list = []
        except Exception:
            blogs_list = []

        new_post = None
        if blog_id:
            # Update existing
            for b in blogs_list:
                if str(b.get('id')) == str(blog_id):
                    b['title'] = title
                    b['content'] = content
                    b['category'] = category
                    b['author'] = author
                    b['image'] = image
                    b['readTime'] = read_time
                    b['excerpt'] = excerpt
                    if date:
                        b['date'] = date
                    new_post = b
                    break
            
            if not new_post:
                # ID provided but not found, create new with this ID
                new_post = {
                    "id": blog_id,
                    "title": title,
                    "content": content,
                    "category": category,
                    "author": author,
                    "image": image,
                    "readTime": read_time,
                    "excerpt": excerpt,
                    "date": date or time.strftime("%Y-%m-%d")
                }
                blogs_list.append(new_post)
        else:
            # Create new
            new_id = str(int(time.time() * 1000))
            new_post = {
                "id": new_id,
                "title": title,
                "content": content,
                "category": category,
                "author": author,
                "image": image,
                "readTime": read_time,
                "excerpt": excerpt,
                "date": date or time.strftime("%Y-%m-%d")
            }
            blogs_list.append(new_post)

        with open(BLOGS_FILE, 'w', encoding='utf-8') as f:
            json.dump(blogs_list, f, indent=4)

        self.send_json_response(200, {"success": True, "post": new_post})

    def handle_blog_delete(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        
        try:
            data = json.loads(body)
        except Exception:
            self.send_json_response(400, {"success": False, "message": "Invalid JSON body"})
            return

        blog_id = data.get('id')
        if not blog_id:
            self.send_json_response(400, {"success": False, "message": "Missing blog ID"})
            return

        if not os.path.exists(BLOGS_FILE):
            self.send_json_response(404, {"success": False, "message": "No blogs database found"})
            return

        with open(BLOGS_FILE, 'r', encoding='utf-8') as f:
            blogs_list = json.load(f)

        updated_blogs = [b for b in blogs_list if str(b.get('id')) != str(blog_id)]
        with open(BLOGS_FILE, 'w', encoding='utf-8') as f:
            json.dump(updated_blogs, f, indent=4)

        self.send_json_response(200, {"success": True, "message": "Blog post deleted successfully"})

    def send_json_response(self, status, payload):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode('utf-8'))

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    """Multi-threaded HTTP server — each request handled in a new thread."""
    daemon_threads = True
    allow_reuse_address = True

if __name__ == '__main__':
    print(f"Starting Threaded Custom API & Static Server in: {PUBLIC_DIR}")
    print(f"Serving at http://localhost:{PORT}")
    server = ThreadedHTTPServer(('0.0.0.0', PORT), CustomAPIRequestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        server.server_close()
