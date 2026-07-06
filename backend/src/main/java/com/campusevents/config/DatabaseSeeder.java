package com.campusevents.config;

import com.campusevents.entity.Role;
import com.campusevents.entity.User;
import com.campusevents.enums.ERole;
import com.campusevents.repository.RoleRepository;
import com.campusevents.repository.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(RoleRepository roleRepository,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Roles
        Role studentRole = seedRoleIfMissing(ERole.ROLE_STUDENT);
        Role coordinatorRole = seedRoleIfMissing(ERole.ROLE_COORDINATOR);
        Role adminRole = seedRoleIfMissing(ERole.ROLE_ADMIN);

        // 2. Seed Default Test Users
        seedUserIfMissing("student@test.com", "Test Student", "CS", studentRole, "password");
        seedUserIfMissing("coordinator@test.com", "Test Coordinator", "IT", coordinatorRole, "password");
        seedUserIfMissing("admin@test.com", "Test Admin", "Administration", adminRole, "password");
        seedUserIfMissing("newadmin@test.com", "New Admin", "Administration", adminRole, "123456");
        
        System.out.println("--- Database Seeded Successfully ---");

        // 3. Startup Debug Logging
        System.out.println("--- STARTUP DEBUG LOGS ---");
        userRepository.findAll().forEach(u -> {
            String roleNames = u.getRoles().stream()
                    .map(r -> r.getName().name())
                    .collect(java.util.stream.Collectors.joining(", "));
            
            boolean matchTest = passwordEncoder.matches("123456", u.getPassword()) || 
                                passwordEncoder.matches("password", u.getPassword());
            
            System.out.println("User email: " + u.getEmail());
            System.out.println("Stored password hash: " + u.getPassword());
            System.out.println("Role names: " + roleNames);
            System.out.println("BCrypt match result: " + matchTest);
            System.out.println("--------------------");
        });
    }

    private Role seedRoleIfMissing(ERole roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(new Role(roleName)));
    }

    private void seedUserIfMissing(String email, String name, String department, Role role, String password) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setDepartment(department);
            user.setEnabled(true);
            
            Set<Role> roles = new HashSet<>();
            roles.add(role);
            user.setRoles(roles);
        }
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
        System.out.println("Seeded/Updated test user: " + email);
    }
}
