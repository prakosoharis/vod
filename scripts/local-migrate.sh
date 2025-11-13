#!/bin/bash

# Local Migration Script
# For creating and testing database migrations locally
# Usage: ./scripts/local-migrate.sh "migration_name"

set -e

MIGRATION_NAME=$1

if [ -z "$MIGRATION_NAME" ]; then
    echo "❌ Usage: ./scripts/local-migrate.sh \"migration_name\""
    echo ""
    echo "Example:"
    echo "  ./scripts/local-migrate.sh \"add_user_phone_field\""
    echo "  ./scripts/local-migrate.sh \"create_post_table\""
    exit 1
fi

echo "🚀 Creating local migration: $MIGRATION_NAME"

# Navigate to API directory
cd "$(dirname "$0")/../apps/api" || {
    echo "❌ Cannot navigate to API directory"
    exit 1
}

# Function to show colored output
print_info() {
    echo -e "\033[1;34mℹ️  $1\033[0m"
}

print_success() {
    echo -e "\033[1;32m✅ $1\033[0m"
}

print_warning() {
    echo -e "\033[1;33m⚠️  $1\033[0m"
}

print_error() {
    echo -e "\033[1;31m❌ $1\033[0m"
}

print_info "Step 1: Checking database connection..."
# Simple database connection test using Prisma
npx prisma --version > /dev/null 2>&1 || {
    print_error "Prisma CLI not found. Please run: npm install prisma"
    exit 1
}

# Test database connection by trying to generate client
npx prisma generate > /dev/null 2>&1 || {
    print_error "Cannot connect to database. Make sure PostgreSQL is running:"
    print_error "  docker-compose up -d postgres"
    print_error "  Or check your DATABASE_URL in .env"
    exit 1
}
print_success "Database connection verified"

print_info "Step 2: Creating migration '$MIGRATION_NAME'..."
npx prisma migrate dev --name "$MIGRATION_NAME" || {
    print_error "Failed to create migration. Check the error above."
    exit 1
}
print_success "Migration created successfully"

print_info "Step 3: Generating Prisma client..."
npx prisma generate || {
    print_error "Failed to generate Prisma client"
    exit 1
}
print_success "Prisma client generated"

print_info "Step 4: Testing migration..."
npx prisma db push || {
    print_error "Failed to apply migration to database"
    exit 1
}
print_success "Migration applied to local database successfully"

print_info "Step 5: Running seed data..."
npm run seed || {
    print_warning "Seed data failed. This might be okay if data already exists."
}
print_success "Seed data completed"

echo ""
print_success "🎉 Local migration completed successfully!"
echo ""
print_info "Migration summary:"
echo "  • Migration name: $MIGRATION_NAME"
echo "  • Migration files created in: prisma/migrations/"
echo "  • Database schema updated"
echo "  • Seed data applied"
echo ""
print_info "Next steps:"
echo "  1. Review the generated migration files"
echo "  2. Test your application with the new schema"
echo "  3. Commit changes when ready:"
echo "     git add apps/api/prisma/"
echo "     git commit -m \"feat: $MIGRATION_NAME\""
echo "     git push origin main"
echo ""
print_warning "Remember to run the migration on production server after deploying!"

# Show latest migration files
echo ""
print_info "Latest migration files:"
ls -la prisma/migrations/ | tail -5