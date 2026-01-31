#!/bin/bash
# RBAC Implementation Comprehensive Audit Script
# Verifies all routes are properly protected with permission middleware

echo "========================================"
echo "RBAC IMPLEMENTATION AUDIT"
echo "========================================"
echo ""

ROUTES_DIR="/Users/ashhad/Dev/soft/Student Management/studentManagement/backend/src/routes"
cd "$ROUTES_DIR"

echo "1️⃣  ROUTE PROTECTION AUDIT"
echo "----------------------------------------"

# Count total route files
TOTAL_ROUTES=$(ls -1 *.routes.ts 2>/dev/null | wc -l | tr -d ' ')
echo "Total route files: $TOTAL_ROUTES"

# Count protected routes (with requirePermission)
PROTECTED_ROUTES=$(grep -l "requirePermission" *.routes.ts 2>/dev/null | wc -l | tr -d ' ')
echo "Protected routes: $PROTECTED_ROUTES"

# Expected public routes
PUBLIC_ROUTES=("auth.routes.ts" "health.routes.ts" "rbac.routes.ts")
EXPECTED_PROTECTED=$((TOTAL_ROUTES - 3))

echo "Expected protected: $EXPECTED_PROTECTED"
echo ""

if [ "$PROTECTED_ROUTES" -eq "$EXPECTED_PROTECTED" ]; then
    echo "✅ PASS: All operational routes are protected"
else
    echo "❌ FAIL: Protection count mismatch"
    echo "   Missing protection in:"
    for file in *.routes.ts; do
        if ! grep -q "requirePermission" "$file" 2>/dev/null; then
            if [[ ! " ${PUBLIC_ROUTES[@]} " =~ " ${file} " ]]; then
                echo "   - $file"
            fi
        fi
    done
fi

echo ""
echo "2️⃣  IMPORT VERIFICATION"
echo "----------------------------------------"

IMPORT_ERRORS=0
for file in *.routes.ts; do
    # Skip public routes
    if [[ ! " ${PUBLIC_ROUTES[@]} " =~ " ${file} " ]]; then
        # Check if file has requirePermission usage
        if grep -q "requirePermission" "$file" 2>/dev/null; then
            # Verify it has the import
            if ! grep -q "import.*requirePermission.*from.*permission.middleware" "$file" 2>/dev/null; then
                echo "❌ MISSING IMPORT: $file"
                IMPORT_ERRORS=$((IMPORT_ERRORS + 1))
            fi
        fi
    fi
done

if [ "$IMPORT_ERRORS" -eq 0 ]; then
    echo "✅ PASS: All imports are correct"
else
    echo "❌ FAIL: $IMPORT_ERRORS files have import issues"
fi

echo ""
echo "3️⃣  PERMISSION USAGE ANALYSIS"
echo "----------------------------------------"

echo "Permission patterns found:"
grep -roh "requirePermission(\"[^\"]*\")" *.routes.ts 2>/dev/null | sort | uniq -c | sort -rn | head -20

echo ""
echo "4️⃣  ROUTE-BY-ROUTE BREAKDOWN"
echo "----------------------------------------"

for file in *.routes.ts; do
    if [[ " ${PUBLIC_ROUTES[@]} " =~ " ${file} " ]]; then
        echo "📂 $file - PUBLIC (Correctly excluded)"
    else
        PERMISSION_COUNT=$(grep -c "requirePermission" "$file" 2>/dev/null || echo "0")
        if [ "$PERMISSION_COUNT" -gt 0 ]; then
            echo "✅ $file - Protected ($PERMISSION_COUNT endpoints)"
        else
            echo "❌ $file - UNPROTECTED"
        fi
    fi
done

echo ""
echo "5️⃣  SUMMARY"
echo "========================================"
echo "Total Routes: $TOTAL_ROUTES"
echo "Protected: $PROTECTED_ROUTES"
echo "Public: 3"
echo "Status: $([ "$PROTECTED_ROUTES" -eq "$EXPECTED_PROTECTED" ] && echo "✅ COMPLETE" || echo "❌ INCOMPLETE")"
echo "========================================"
