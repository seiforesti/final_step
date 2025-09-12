#!/usr/bin/env python3
"""
Check current user permissions for data discovery
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'data_wave', 'backend', 'scripts_automation'))

from app.db_session import get_session
from app.models.auth_models import Permission, Role, User, UserRole, RolePermission
from sqlmodel import select

def check_user_permissions():
    print('🔍 CHECKING CURRENT USER PERMISSIONS')
    print('=' * 60)
    
    with get_session() as session:
        try:
            # Get user 1
            user = session.get(User, 1)
            if not user:
                print('❌ User 1 not found')
                return
            
            print(f'👤 User: {user.email}')
            print(f'👤 User ID: {user.id}')
            print(f'👤 User Role: {user.role}')
            
            # Check all permissions in the system
            print(f'\\n📋 ALL PERMISSIONS IN SYSTEM:')
            permissions = session.exec(select(Permission)).all()
            print(f'Total permissions: {len(permissions)}')
            for perm in permissions:
                print(f'  - ID: {perm.id} | {perm.action} on {perm.resource}')
            
            # Check scan-related permissions specifically
            print(f'\\n🔍 SCAN-RELATED PERMISSIONS:')
            scan_perms = session.exec(select(Permission).where(Permission.resource == 'scan')).all()
            if scan_perms:
                for perm in scan_perms:
                    print(f'  - ID: {perm.id} | {perm.action} on {perm.resource}')
            else:
                print('  ❌ No scan permissions found!')
            
            # Check all roles
            print(f'\\n👥 ALL ROLES IN SYSTEM:')
            roles = session.exec(select(Role)).all()
            print(f'Total roles: {len(roles)}')
            for role in roles:
                print(f'  - ID: {role.id} | Name: {role.name} | Description: {role.description}')
            
            # Check user's roles
            print(f'\\n🔗 USER ROLES:')
            user_roles = session.exec(select(UserRole).where(UserRole.user_id == 1)).all()
            if user_roles:
                for ur in user_roles:
                    role = session.get(Role, ur.role_id)
                    print(f'  - Role ID: {ur.role_id} | Role Name: {role.name if role else "Unknown"}')
            else:
                print('  ❌ User has no roles assigned!')
            
            # Check role permissions
            print(f'\\n🔐 ROLE PERMISSIONS:')
            for ur in user_roles:
                role = session.get(Role, ur.role_id)
                if role:
                    print(f'\\n  Role: {role.name} (ID: {role.id})')
                    role_perms = session.exec(select(RolePermission).where(RolePermission.role_id == ur.role_id)).all()
                    if role_perms:
                        for rp in role_perms:
                            perm = session.get(Permission, rp.permission_id)
                            if perm:
                                print(f'    - {perm.action} on {perm.resource} (Permission ID: {perm.id})')
                    else:
                        print('    ❌ No permissions assigned to this role')
            
            # Check what permissions are needed for data discovery
            print(f'\\n🎯 REQUIRED PERMISSIONS FOR DATA DISCOVERY:')
            print('  - scan.view (for viewing discovery results)')
            print('  - scan.edit (for running discovery)')
            
            # Check if user has these permissions
            print(f'\\n✅ PERMISSION CHECK:')
            has_scan_view = False
            has_scan_edit = False
            
            for ur in user_roles:
                role_perms = session.exec(select(RolePermission).where(RolePermission.role_id == ur.role_id)).all()
                for rp in role_perms:
                    perm = session.get(Permission, rp.permission_id)
                    if perm and perm.resource == 'scan':
                        if perm.action == 'view':
                            has_scan_view = True
                        elif perm.action == 'edit':
                            has_scan_edit = True
            
            print(f'  - scan.view: {"✅ YES" if has_scan_view else "❌ NO"}')
            print(f'  - scan.edit: {"✅ YES" if has_scan_edit else "❌ NO"}')
            
            if has_scan_view and has_scan_edit:
                print(f'\\n🎉 USER HAS ALL REQUIRED PERMISSIONS!')
            else:
                print(f'\\n⚠️  USER IS MISSING REQUIRED PERMISSIONS!')
                print('   This is why the frontend button is not working.')
            
        except Exception as e:
            print(f'❌ Error: {e}')
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    check_user_permissions()
