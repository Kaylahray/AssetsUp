use starknet::{ContractAddress, contract_address_const, get_caller_address, get_block_timestamp};
use starknet::testing::{set_caller_address, set_block_timestamp};
use manage_assets::interfaces::{AssetInfo, AssetStatus, AssetEvent, EventType, AssignmentType, AssetAssignment};
use manage_assets::asset_registry::AssetRegistryComponent;
use manage_assets::asset_transfer::AssetTransferComponent;
use manage_assets::tests::test_utils::{create_address, set_caller, set_timestamp, create_test_asset_info, assert_event_emitted};

// Helper function to set up test environment
fn setup() -> (AssetRegistryComponent::ComponentState<'static>, AssetTransferComponent::ComponentState<'static>) {
    let mut registry_state = AssetRegistryComponent::component_state_for_testing();
    let transfer_state = AssetTransferComponent::component_state_for_testing();
    
    // Register a test asset
    let admin = create_address(1);
    set_caller(admin);
    
    let asset_id = 123;
    let asset_hash = 456;
    let serial_number = 789;
    
    registry_state.register_asset(asset_hash, asset_id, serial_number);
    
    (registry_state, transfer_state)
}

#[test]
fn test_transfer_asset() {
    // Set up test environment
    let (registry_state, mut transfer_state) = setup();
    
    let asset_id = 123;
    let admin = create_address(1);
    let new_owner = 456;
    
    // Set caller to admin
    set_caller(admin);
    
    // Transfer asset
    let result = transfer_state.transfer_asset(asset_id, new_owner);
    
    // Verify result
    assert(result == asset_id, 'Wrong asset ID returned');
    
    // Verify new owner
    let owner = transfer_state.get_asset_owner(asset_id);
    assert(owner == new_owner, 'Wrong owner');
    
    // Verify transfer history
    let history = transfer_state.get_transfer_history(asset_id);
    assert(history.len() == 1, 'Should have 1 transfer');
    assert(history[0].from_owner == admin.into(), 'Wrong from owner');
    assert(history[0].to_owner == new_owner, 'Wrong to owner');
}

#[test]
fn test_batch_transfer() {
    // Set up test environment
    let (mut registry_state, mut transfer_state) = setup();
    
    let admin = create_address(1);
    set_caller(admin);
    
    // Register multiple assets
    let asset_id1 = 123;
    let asset_id2 = 456;
    let asset_id3 = 789;
    
    // First asset already registered in setup
    registry_state.register_asset(200, asset_id2, 201);
    registry_state.register_asset(300, asset_id3, 301);
    
    // Create array of asset IDs
    let mut asset_ids = ArrayTrait::new();
    asset_ids.append(asset_id1);
    asset_ids.append(asset_id2);
    asset_ids.append(asset_id3);
    
    let new_owner = 999;
    
    // Batch transfer
    let result = transfer_state.batch_transfer(asset_ids, new_owner);
    
    // Verify result
    assert(result == 3, 'Should have transferred 3 assets');
    
    // Verify new owners
    assert(transfer_state.get_asset_owner(asset_id1) == new_owner, 'Asset 1 wrong owner');
    assert(transfer_state.get_asset_owner(asset_id2) == new_owner, 'Asset 2 wrong owner');
    assert(transfer_state.get_asset_owner(asset_id3) == new_owner, 'Asset 3 wrong owner');
}

#[test]
fn test_temporary_assignment() {
    // Set up test environment
    let (registry_state, mut transfer_state) = setup();
    
    let asset_id = 123;
    let admin = create_address(1);
    let user_id = 456;
    let current_time = 1000u64;
    let due_date = current_time + 86400; // 1 day later
    
    // Set current time
    set_timestamp(current_time);
    
    // Set caller to admin
    set_caller(admin);
    
    // Create temporary assignment
    let result = transfer_state.temporary_assign(asset_id, user_id, due_date);
    
    // Verify result
    assert(result == asset_id, 'Wrong asset ID returned');
    
    // Verify assignment
    let assignment = transfer_state.get_assignment(asset_id);
    assert(assignment.user_id == user_id, 'Wrong user ID');
    assert(assignment.due_date == due_date, 'Wrong due date');
    assert(!assignment.is_returned, 'Should not be returned');
    
    // Verify owner changed temporarily
    let owner = transfer_state.get_asset_owner(asset_id);
    assert(owner == user_id, 'Owner should be user');
}

#[test]
fn test_return_assignment() {
    // Set up test environment
    let (registry_state, mut transfer_state) = setup();
    
    let asset_id = 123;
    let admin = create_address(1);
    let user_id = 456;
    let current_time = 1000u64;
    let due_date = current_time + 86400; // 1 day later
    
    // Set current time
    set_timestamp(current_time);
    
    // Set caller to admin
    set_caller(admin);
    
    // Create temporary assignment
    transfer_state.temporary_assign(asset_id, user_id, due_date);
    
    // Set time to return time
    let return_time = current_time + 43200; // 12 hours later
    set_timestamp(return_time);
    
    // Return assignment
    let result = transfer_state.return_assignment(asset_id);
    
    // Verify result
    assert(result == asset_id, 'Wrong asset ID returned');
    
    // Verify assignment updated
    let assignment = transfer_state.get_assignment(asset_id);
    assert(assignment.is_returned, 'Should be returned');
    assert(assignment.return_time == return_time, 'Wrong return time');
    
    // Verify owner changed back
    let owner = transfer_state.get_asset_owner(asset_id);
    assert(owner == admin.into(), 'Owner should be admin again');
}

#[test]
fn test_is_overdue() {
    // Set up test environment
    let (registry_state, mut transfer_state) = setup();
    
    let asset_id = 123;
    let admin = create_address(1);
    let user_id = 456;
    let current_time = 1000u64;
    let due_date = current_time + 86400; // 1 day later
    
    // Set current time
    set_timestamp(current_time);
    
    // Set caller to admin
    set_caller(admin);
    
    // Create temporary assignment
    transfer_state.temporary_assign(asset_id, user_id, due_date);
    
    // Check not overdue at current time
    assert(!transfer_state.is_overdue(asset_id), 'Should not be overdue');
    
    // Set time past due date
    set_timestamp(due_date + 1);
    
    // Check overdue
    assert(transfer_state.is_overdue(asset_id), 'Should be overdue');
    
    // Return assignment
    transfer_state.return_assignment(asset_id);
    
    // Check not overdue after return
    assert(!transfer_state.is_overdue(asset_id), 'Should not be overdue after return');
}
