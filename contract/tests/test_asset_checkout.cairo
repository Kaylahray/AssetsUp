use starknet::{ContractAddress, contract_address_const, get_caller_address, get_block_timestamp};
use starknet::testing::{set_caller_address, set_block_timestamp};
use manage_assets::interfaces::{AssetInfo, AssetStatus, AssetEvent, EventType, AssetCheckout};
use manage_assets::asset_checkout::AssetCheckoutComponent;
use manage_assets::tests::test_utils::{create_address, set_caller, set_timestamp, create_test_asset_info, create_test_checkout, assert_event_emitted};

#[test]
fn test_checkout_asset() {
    // Initialize component
    let mut state = AssetCheckoutComponent::component_state_for_testing();
    
    // Set up test data
    let admin = create_address(1);
    let asset_id = 123;
    let user_id = 456;
    let current_time = 1000u64;
    let due_time = current_time + 86400; // 1 day later
    let purpose = 'testing';
    
    // Set current time and caller
    set_timestamp(current_time);
    set_caller(admin);
    
    // Checkout asset
    let checkout_id = state.checkout_asset(asset_id, user_id, due_time, purpose);
    
    // Verify checkout ID is non-zero
    assert(checkout_id != 0, 'Should return non-zero ID');
    
    // Get checkout and verify data
    let checkout = state.get_checkout(checkout_id);
    assert(checkout.asset_id == asset_id, 'Wrong asset ID');
    assert(checkout.user_id == user_id, 'Wrong user ID');
    assert(checkout.checkout_time == current_time, 'Wrong checkout time');
    assert(checkout.due_time == due_time, 'Wrong due time');
    assert(checkout.status == 'active', 'Wrong status');
    assert(checkout.purpose == purpose, 'Wrong purpose');
    
    // Verify active checkouts
    let active_checkouts = state.get_active_checkouts();
    assert(active_checkouts.len() == 1, 'Should have 1 active checkout');
    assert(active_checkouts[0].checkout_id == checkout_id, 'Wrong checkout in active list');
    
    // Verify asset checkouts
    let asset_checkouts = state.get_asset_checkouts(asset_id);
    assert(asset_checkouts.len() == 1, 'Should have 1 checkout for asset');
    assert(asset_checkouts[0].checkout_id == checkout_id, 'Wrong checkout in asset list');
    
    // Verify user checkouts
    let user_checkouts = state.get_user_checkouts(user_id);
    assert(user_checkouts.len() == 1, 'Should have 1 checkout for user');
    assert(user_checkouts[0].checkout_id == checkout_id, 'Wrong checkout in user list');
}

#[test]
fn test_checkin_asset() {
    // Initialize component
    let mut state = AssetCheckoutComponent::component_state_for_testing();
    
    // Set up test data
    let admin = create_address(1);
    let asset_id = 123;
    let user_id = 456;
    let current_time = 1000u64;
    let due_time = current_time + 86400; // 1 day later
    let purpose = 'testing';
    
    // Set current time and caller
    set_timestamp(current_time);
    set_caller(admin);
    
    // Checkout asset
    let checkout_id = state.checkout_asset(asset_id, user_id, due_time, purpose);
    
    // Set return time
    let return_time = current_time + 43200; // 12 hours later
    set_timestamp(return_time);
    
    // Checkin asset
    let condition_notes = 'good condition';
    let result = state.checkin_asset(checkout_id, condition_notes);
    
    // Verify result
    assert(result == checkout_id, 'Wrong checkout ID returned');
    
    // Get checkout and verify updated data
    let checkout = state.get_checkout(checkout_id);
    assert(checkout.return_time == return_time, 'Wrong return time');
    assert(checkout.status == 'returned', 'Wrong status');
    
    // Verify active checkouts
    let active_checkouts = state.get_active_checkouts();
    assert(active_checkouts.len() == 0, 'Should have 0 active checkouts');
}

#[test]
fn test_get_overdue_checkouts() {
    // Initialize component
    let mut state = AssetCheckoutComponent::component_state_for_testing();
    
    // Set up test data
    let admin = create_address(1);
    let asset_id1 = 123;
    let asset_id2 = 456;
    let user_id = 789;
    let current_time = 1000u64;
    let due_time1 = current_time + 86400; // 1 day later
    let due_time2 = current_time + 43200; // 12 hours later
    
    // Set current time and caller
    set_timestamp(current_time);
    set_caller(admin);
    
    // Checkout assets
    let checkout_id1 = state.checkout_asset(asset_id1, user_id, due_time1, 'purpose1');
    let checkout_id2 = state.checkout_asset(asset_id2, user_id, due_time2, 'purpose2');
    
    // Set time to after due_time2 but before due_time1
    let check_time = current_time + 60000; // 16.7 hours later
    
    // Get overdue checkouts
    let overdue = state.get_overdue_checkouts(check_time);
    
    // Verify only one checkout is overdue
    assert(overdue.len() == 1, 'Should have 1 overdue checkout');
    assert(overdue[0].checkout_id == checkout_id2, 'Wrong checkout is overdue');
    
    // Set time to after both due times
    let check_time2 = current_time + 100000; // 27.8 hours later
    
    // Get overdue checkouts again
    let overdue2 = state.get_overdue_checkouts(check_time2);
    
    // Verify both checkouts are overdue
    assert(overdue2.len() == 2, 'Should have 2 overdue checkouts');
}

#[test]
#[should_panic(expected: ('Checkout not active',))]
fn test_checkin_already_returned() {
    // Initialize component
    let mut state = AssetCheckoutComponent::component_state_for_testing();
    
    // Set up test data
    let admin = create_address(1);
    let asset_id = 123;
    let user_id = 456;
    let current_time = 1000u64;
    let due_time = current_time + 86400;
    
    // Set current time and caller
    set_timestamp(current_time);
    set_caller(admin);
    
    // Checkout asset
    let checkout_id = state.checkout_asset(asset_id, user_id, due_time, 'purpose');
    
    // Checkin asset
    state.checkin_asset(checkout_id, 'good');
    
    // Try to checkin again - should fail
    state.checkin_asset(checkout_id, 'good again');
}
