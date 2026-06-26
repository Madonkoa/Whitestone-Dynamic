Write-Host "Setting up backend..." -ForegroundColor Green

# Create folders
New-Item -ItemType Directory -Path routes, middleware, config -Force

# Create .env
@"
PORT=3000
JWT_SECRET=whitestone_super_secret_key_2026_change_this
"@ | Out-File -FilePath .env -Encoding UTF8

# Update .gitignore
Add-Content -Path ../.gitignore -Value "`nbackend/node_modules/"
Add-Content -Path ../.gitignore -Value "backend/database.db"

Write-Host "✅ Backend setup complete!" -ForegroundColor Green
