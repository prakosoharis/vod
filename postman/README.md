# VOD Platform - Postman Collection

Complete Postman collection for VOD Platform Upload API testing.

## 📁 Files Available

1. **`VOD Upload API.postman_collection.json`** - Main API collection
2. **`VOD Development Environment.postman_environment.json`** - Development environment
3. **`VOD Production Environment.postman_environment.json`** - Production environment

## 🚀 Quick Setup

### 1. Import Collection to Postman

1. Open Postman
2. Click **Import** → **Files**
3. Select `VOD Upload API.postman_collection.json`
4. Click **Import**

### 2. Import Environments

1. Click **Import** → **Files**
2. Select both environment files:
   - `VOD Development Environment.postman_environment.json`
   - `VOD Production Environment.postman_environment.json`
3. Click **Import**

### 3. Select Environment

1. In Postman top-right, select **VOD Development** for local testing
2. Or select **VOD Production** for production testing

## 🔐 Authentication Flow

**Step 1: Register User**
```
POST /api/auth/register
{
  "email": "testuser@vod.com",
  "password": "password123",
  "full_name": "Test User"
}
```

**Step 2: Login**
```
POST /api/auth/login
{
  "email": "testuser@vod.com",
  "password": "password123"
}
```

The collection will automatically save the JWT token for subsequent requests.

## 📤 Upload Endpoints

### Available Types:
- **`thumbnail`** - Movie/series thumbnails
- **`backdrop`** - Background images
- **`avatar`** - User profile pictures
- **`logo`** - Brand/company logos

### Upload Requests:
```
POST /api/upload?type={thumbnail|backdrop|avatar|logo}
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body: form-data with key "file" and file value
```

### File Specifications:
- **Supported Formats:** JPEG, PNG, WebP, GIF
- **Maximum Size:** 10MB per file
- **Auto-generated UUID** filenames
- **Organized storage** by type

## 🗂️ File Management

### Get File Info:
```
GET /api/upload/{type}/{filename}
```

### Delete File:
```
DELETE /api/upload/{type}/{filename}
```

### Direct File Access:
```
GET /api/uploads/{type}/{filename}
```

## 🌐 Access Points

### Development:
- **API:** `http://localhost:3005`
- **Backoffice:** `http://localhost:3006`
- **Web App:** `http://localhost:5173`

### Production:
- **API:** `https://api.mostara.id`
- **Backoffice:** `https://mostara.id:3006`
- **Web App:** `https://mostara.id`

## 📊 Collection Structure

### 🗂️ Folders:

1. **🔐 Authentication**
   - Register User
   - Login User
   - Get User Profile

2. **📤 Upload Endpoints**
   - Upload Thumbnail
   - Upload Backdrop
   - Upload Avatar
   - Upload Logo

3. **🗂️ File Management**
   - Get File Info
   - Delete Uploaded File

4. **🌐 Access Uploaded Files**
   - View Thumbnail
   - View Backdrop
   - View Avatar
   - View Logo

5. **📊 System Status**
   - Health Check

## 🧪 Test Scripts

The collection includes automated test scripts that:

- ✅ **Auto-save authentication tokens** after login
- ✅ **Validate upload responses** and save URLs
- ✅ **Monitor response times**
- ✅ **Check token expiration** with warnings
- ✅ **Log environment information**

## 📝 Usage Examples

### Upload a Thumbnail:
1. Select **VOD Development** environment
2. Run **Login User** request
3. Go to **Upload Thumbnail** request
4. Select an image file (JPG, PNG, WebP, GIF)
5. Click **Send**
6. Check the **URL** in response body
7. Access uploaded file at: `http://localhost:3005/api/uploads/thumbnail/[filename]`

### Multiple Uploads:
The collection supports concurrent uploads. You can:
- Upload multiple files simultaneously
- Each upload type has separate storage folders
- Files get unique UUID-based filenames
- URLs are automatically saved as collection variables

## 🔧 Environment Variables

### Pre-defined Variables:
- `baseUrl` - API server URL
- `userToken` - JWT authentication token (auto-populated)
- `userEmail` - Current user email (auto-populated)
- `thumbnailUrl` - Last uploaded thumbnail URL
- `backdropUrl` - Last uploaded backdrop URL
- `avatarUrl` - Last uploaded avatar URL
- `logoUrl` - Last uploaded logo URL

### Customizable Variables:
- `maxFileSize` - Maximum file size limit
- `allowedTypes` - Allowed MIME types

## 🐛 Troubleshooting

### Common Issues:

1. **401 Unauthorized**
   - Run **Login User** request first
   - Check if token is expired

2. **413 Payload Too Large**
   - File size exceeds 10MB limit
   - Compress or resize image

3. **400 Bad Request**
   - Invalid file type
   - Use only JPEG, PNG, WebP, or GIF

4. **404 Not Found**
   - API server not running
   - Check environment variables
   - Verify baseUrl is correct

### Debug Tips:
- Check **Console** tab in Postman for detailed logs
- Use **Test Results** tab to see test outputs
- Monitor **Response Time** for performance
- Check **Environment** variables are set correctly

## 📞 Support

For API issues or questions:
- Check the API server logs
- Verify database connection
- Ensure proper file permissions
- Contact development team

---

**🎉 Ready to test!**
Import the collection and start uploading!