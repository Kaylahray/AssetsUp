#[contract]
mod AssetTransfer {
    use starknet::get_caller_address;
    use starknet::ContractAddress;
    use starknet::contract_address_const;
    use array::ArrayTrait;
    use option::OptionTrait;
    use traits::Into;
    use traits::TryInto;
    use box::BoxTrait;
    use zeroable::Zeroable;
    use starknet::info::get_block_timestamp;

    struct Storage {
        // Admin address
        admin: ContractAddress,
        
        // Asset registry contract address
        asset_registry: ContractAddress,
        
        // Asset ownership mapping: asset_id => owner_id
        asset_owners: LegacyMap<felt252, felt252>,
        
        // Asset transfer history: asset_id => array of transfers
        transfer_history: LegacyMap<felt252, Array<OwnershipTransfer>>,
        
        // Temporary assignments: asset_id => TemporaryAssignment
        temporary_assignments: LegacyMap<felt252, TemporaryAssignment>,
    }

    #[derive(Drop, Serde)]
    struct OwnershipTransfer {
        from_owner: felt252,
        to_owner: felt252,
        timestamp: u64,
    }

    #[derive(Drop, Serde)]
    struct TemporaryAssignment {
        user_id: felt252,
        start_time: u64,
        due_date: u64,
        is_returned: bool,
        return_time: u64,
    }

    #[event]
    fn OwnershipTransferred(asset_id: felt252, from_owner: felt252, to_owner: felt252) {}

    #[event]
    fn TemporaryAssignmentCreated(asset_id: felt252, user_id: felt252, due_date: u64) {}

    #[event]
    fn TemporaryAssignmentReturned(asset_id: felt252, user_id: felt252, return_time: u64) {}

    #[event]
    fn BatchTransferCompleted(asset_count: u256, to_owner: felt252) {}

    #[constructor]
    fn constructor(admin_address: ContractAddress, asset_registry_address: ContractAddress) {
        admin::write(admin_address);
        asset_registry::write(asset_registry_address);
    }

    #[external]
    fn transfer_ownership(asset_id: felt252, to_owner: felt252) -> felt252 {
        // Only admin can transfer ownership
        assert(get_caller_address() == admin::read(), 'Not authorized');
        
        // Get current owner
        let from_owner = asset_owners::read(asset_id);
        
        // Update ownership
        asset_owners::write(asset_id, to_owner);
        
        // Record transfer in history
        let timestamp = get_block_timestamp();
        let transfer = OwnershipTransfer {
            from_owner: from_owner,
            to_owner: to_owner,
            timestamp: timestamp,
        };
        
        let mut history = transfer_history::read(asset_id);
        history.append(transfer);
        transfer_history::write(asset_id, history);
        
        // Emit event
        OwnershipTransferred(asset_id, from_owner, to_owner);
        
        return asset_id;
    }

    #[external]
    fn batch_transfer_ownership(asset_ids: Array<felt252>, to_owner: felt252) -> u256 {
        // Only admin can transfer ownership
        assert(get_caller_address() == admin::read(), 'Not authorized');
        
        let mut i: u256 = 0;
        let asset_count = asset_ids.len();
        
        // Transfer each asset
        loop {
            if i >= asset_count {
                break;
            }
            
            let asset_id = asset_ids.at(i);
            let from_owner = asset_owners::read(*asset_id);
            
            // Update ownership
            asset_owners::write(*asset_id, to_owner);
            
            // Record transfer in history
            let timestamp = get_block_timestamp();
            let transfer = OwnershipTransfer {
                from_owner: from_owner,
                to_owner: to_owner,
                timestamp: timestamp,
            };
            
            let mut history = transfer_history::read(*asset_id);
            history.append(transfer);
            transfer_history::write(*asset_id, history);
            
            // Emit event for individual transfer
            OwnershipTransferred(*asset_id, from_owner, to_owner);
            
            i += 1;
        };
        
        // Emit batch completion event
        BatchTransferCompleted(asset_count, to_owner);
        
        return asset_count;
    }

    #[external]
    fn temporary_assignment(asset_id: felt252, user_id: felt252, due_date: u64) -> felt252 {
        // Only admin can create temporary assignments
        assert(get_caller_address() == admin::read(), 'Not authorized');
        
        // Create temporary assignment
        let timestamp = get_block_timestamp();
        let assignment = TemporaryAssignment {
            user_id: user_id,
            start_time: timestamp,
            due_date: due_date,
            is_returned: false,
            return_time: 0,
        };
        
        temporary_assignments::write(asset_id, assignment);
        
        // Also transfer ownership temporarily
        let from_owner = asset_owners::read(asset_id);
        asset_owners::write(asset_id, user_id);
        
        // Record transfer in history
        let transfer = OwnershipTransfer {
            from_owner: from_owner,
            to_owner: user_id,
            timestamp: timestamp,
        };
        
        let mut history = transfer_history::read(asset_id);
        history.append(transfer);
        transfer_history::write(asset_id, history);
        
        // Emit events
        TemporaryAssignmentCreated(asset_id, user_id, due_date);
        OwnershipTransferred(asset_id, from_owner, user_id);
        
        return asset_id;
    }

    #[external]
    fn return_temporary_assignment(asset_id: felt252, original_owner: felt252) -> felt252 {
        // Only admin can process returns
        assert(get_caller_address() == admin::read(), 'Not authorized');
        
        // Get the assignment
        let mut assignment = temporary_assignments::read(asset_id);
        assert(!assignment.user_id.is_zero(), 'No temporary assignment');
        assert(!assignment.is_returned, 'Already returned');
        
        // Mark as returned
        let timestamp = get_block_timestamp();
        assignment.is_returned = true;
        assignment.return_time = timestamp;
        temporary_assignments::write(asset_id, assignment);
        
        // Transfer ownership back
        let from_owner = asset_owners::read(asset_id);
        asset_owners::write(asset_id, original_owner);
        
        // Record transfer in history
        let transfer = OwnershipTransfer {
            from_owner: from_owner,
            to_owner: original_owner,
            timestamp: timestamp,
        };
        
        let mut history = transfer_history::read(asset_id);
        history.append(transfer);
        transfer_history::write(asset_id, history);
        
        // Emit events
        TemporaryAssignmentReturned(asset_id, assignment.user_id, timestamp);
        OwnershipTransferred(asset_id, from_owner, original_owner);
        
        return asset_id;
    }

    #[view]
    fn get_owner(asset_id: felt252) -> felt252 {
        return asset_owners::read(asset_id);
    }

    #[view]
    fn get_transfer_history(asset_id: felt252) -> Array<OwnershipTransfer> {
        return transfer_history::read(asset_id);
    }

    #[view]
    fn get_temporary_assignment(asset_id: felt252) -> TemporaryAssignment {
        return temporary_assignments::read(asset_id);
    }

    #[view]
    fn is_overdue(asset_id: felt252) -> bool {
        let assignment = temporary_assignments::read(asset_id);
        
        // If no assignment or already returned, not overdue
        if assignment.user_id.is_zero() || assignment.is_returned {
            return false;
        }
        
        // Check if current time is past due date
        let current_time = get_block_timestamp();
        return current_time > assignment.due_date;
    }
}
