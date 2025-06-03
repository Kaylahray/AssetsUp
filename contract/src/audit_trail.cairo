use starknet::{ContractAddress, get_caller_address, get_block_timestamp};

#[starknet::component]
mod AuditTrailComponent {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use manage_assets::interfaces::{EventType};

    #[storage]
    struct Storage {
        // Audit logs storage
        audit_logs: LegacyMap<felt252, AuditLog>,
        audit_log_exists: LegacyMap<felt252, bool>,
        
        // Asset audit trail
        asset_audit_trail: LegacyMap<(felt252, u32), felt252>, // (asset_id, index) => log_id
        asset_audit_count: LegacyMap<felt252, u32>,
        
        // User audit trail
        user_audit_trail: LegacyMap<(felt252, u32), felt252>, // (user_id, index) => log_id
        user_audit_count: LegacyMap<felt252, u32>,
        
        // Global audit trail
        global_audit_trail: LegacyMap<u32, felt252>, // index => log_id
        global_audit_count: u32,
        
        // Audit verification
        audit_verifiers: LegacyMap<ContractAddress, bool>,
    }

    #[derive(Copy, Drop, Serde, starknet::Store)]
    struct AuditLog {
        log_id: felt252,
        timestamp: u64,
        event_type: EventType,
        asset_id: felt252,
        user_id: felt252,
        action: felt252,
        details: felt252,
        metadata_hash: felt252,
        previous_log_hash: felt252,
        verified: bool,
        verifier: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        AuditLogCreated: AuditLogCreated,
        AuditLogVerified: AuditLogVerified,
        VerifierAdded: VerifierAdded,
        VerifierRemoved: VerifierRemoved,
    }

    #[derive(Drop, starknet::Event)]
    struct AuditLogCreated {
        log_id: felt252,
        event_type: EventType,
        asset_id: felt252,
        user_id: felt252,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct AuditLogVerified {
        log_id: felt252,
        verifier: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct VerifierAdded {
        verifier: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct VerifierRemoved {
        verifier: ContractAddress,
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _create_audit_log(
            ref self: ComponentState<'_>,
            event_type: EventType,
            asset_id: felt252,
            user_id: felt252,
            action: felt252,
            details: felt252,
        ) -> felt252 {
            let timestamp = get_block_timestamp();
            let caller = get_caller_address();
            
            // Get previous log hash for chain integrity
            let global_count = self.global_audit_count.read();
            let previous_log_hash = if global_count > 0 {
                let previous_log_id = self.global_audit_trail.read(global_count - 1);
                let previous_log = self.audit_logs.read(previous_log_id);
                pedersen_hash(previous_log.log_id, previous_log.metadata_hash)
            } else {
                0
            };
            
            // Generate log ID and metadata hash
            let log_id = pedersen_hash(asset_id, timestamp);
            let metadata_hash = pedersen_hash(
                pedersen_hash(action, details),
                pedersen_hash(user_id, caller.into())
            );
            
            // Create audit log
            let audit_log = AuditLog {
                log_id,
                timestamp,
                event_type,
                asset_id,
                user_id,
                action,
                details,
                metadata_hash,
                previous_log_hash,
                verified: false,
                verifier: contract_address_const::<0>(),
            };
            
            // Store audit log
            self.audit_logs.write(log_id, audit_log);
            self.audit_log_exists.write(log_id, true);
            
            // Update asset audit trail
            let asset_count = self.asset_audit_count.read(asset_id);
            self.asset_audit_trail.write((asset_id, asset_count), log_id);
            self.asset_audit_count.write(asset_id, asset_count + 1);
            
            // Update user audit trail
            let user_count = self.user_audit_count.read(user_id);
            self.user_audit_trail.write((user_id, user_count), log_id);
            self.user_audit_count.write(user_id, user_count + 1);
            
            // Update global audit trail
            self.global_audit_trail.write(global_count, log_id);
            self.global_audit_count.write(global_count + 1);
            
            // Emit event
            self.emit(AuditLogCreated {
                log_id,
                event_type,
                asset_id,
                user_id,
                timestamp,
            });
            
            log_id
        }
    }

    #[embeddable_as(AuditTrailImpl)]
    impl AuditTrail<
        TContractState,
        +HasComponent<TContractState>,
    > of manage_assets::interfaces::IAuditTrail<ComponentState<TContractState>> {
        fn create_audit_log(
            ref self: ComponentState<TContractState>,
            event_type: EventType,
            asset_id: felt252,
            user_id: felt252,
            action: felt252,
            details: felt252,
        ) -> felt252 {
            self._create_audit_log(event_type, asset_id, user_id, action, details)
        }
        
        fn verify_audit_log(
            ref self: ComponentState<TContractState>,
            log_id: felt252,
        ) {
            let caller = get_caller_address();
            
            // Check if caller is a verifier
            assert(self.audit_verifiers.read(caller), 'Not authorized verifier');
            
            // Get and update audit log
            let mut audit_log = self.audit_logs.read(log_id);
            assert(!audit_log.verified, 'Already verified');
            
            audit_log.verified = true;
            audit_log.verifier = caller;
            self.audit_logs.write(log_id, audit_log);
            
            // Emit event
            self.emit(AuditLogVerified {
                log_id,
                verifier: caller,
            });
        }
        
        fn get_audit_log(
            self: @ComponentState<TContractState>,
            log_id: felt252,
        ) -> AuditLog {
            assert(self.audit_log_exists.read(log_id), 'Audit log does not exist');
            self.audit_logs.read(log_id)
        }
        
        fn get_asset_audit_trail(
            self: @ComponentState<TContractState>,
            asset_id: felt252,
        ) -> Array<AuditLog> {
            let count = self.asset_audit_count.read(asset_id);
            let mut logs = ArrayTrait::new();
            
            let mut i: u32 = 0;
            while i < count {
                let log_id = self.asset_audit_trail.read((asset_id, i));
                let log = self.audit_logs.read(log_id);
                logs.append(log);
                i += 1;
            }
            
            logs
        }
        
        fn get_user_audit_trail(
            self: @ComponentState<TContractState>,
            user_id: felt252,
        ) -> Array<AuditLog> {
            let count = self.user_audit_count.read(user_id);
            let mut logs = ArrayTrait::new();
            
            let mut i: u32 = 0;
            while i < count {
                let log_id = self.user_audit_trail.read((user_id, i));
                let log = self.audit_logs.read(log_id);
                logs.append(log);
                i += 1;
            }
            
            logs
        }
        
        fn verify_audit_chain(
            self: @ComponentState<TContractState>,
            start_index: u32,
            end_index: u32,
        ) -> bool {
            assert(start_index < end_index, 'Invalid range');
            assert(end_index <= self.global_audit_count.read(), 'End index out of range');
            
            let mut i = start_index;
            while i < end_index {
                let log_id = self.global_audit_trail.read(i);
                let log = self.audit_logs.read(log_id);
                
                // Verify chain integrity
                if i > 0 {
                    let previous_log_id = self.global_audit_trail.read(i - 1);
                    let previous_log = self.audit_logs.read(previous_log_id);
                    let expected_hash = pedersen_hash(previous_log.log_id, previous_log.metadata_hash);
                    
                    if log.previous_log_hash != expected_hash {
                        return false;
                    }
                }
                
                i += 1;
            }
            
            true
        }
        
        fn add_verifier(
            ref self: ComponentState<TContractState>,
            verifier: ContractAddress,
        ) {
            // Only admin can add verifiers
            // In production, add proper access control
            self.audit_verifiers.write(verifier, true);
            
            self.emit(VerifierAdded { verifier });
        }
        
        fn remove_verifier(
            ref self: ComponentState<TContractState>,
            verifier: ContractAddress,
        ) {
            // Only admin can remove verifiers
            // In production, add proper access control
            self.audit_verifiers.write(verifier, false);
            
            self.emit(VerifierRemoved { verifier });
        }
    }
}
