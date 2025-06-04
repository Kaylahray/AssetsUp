use starknet::{ContractAddress, contract_address_const, get_caller_address, get_block_timestamp};
use starknet::testing::{set_caller_address, set_block_timestamp};
use manage_assets::interfaces::{EventType, AuditLog};
use manage_assets::audit_trail::AuditTrailComponent;
use manage_assets::tests::test_utils::{create_address, set_caller, set_timestamp, assert_event_emitted};

#[test]
fn test_create_audit_log() {
    // Initialize component
    let mut state = AuditTrailComponent::component_state_for_testing();
    
    // Set up test data
    let admin = create_address(1);
    let asset_id = 123;
    let user_id = 456;
    let action = 'register';
    let details = 'Asset registration';
    let current_time = 1000u64;
    
    // Set current time and caller
    set_timestamp(current_time);
    set_caller(admin);
    
    // Create audit log
    let log_id = state.create_audit_log(EventType::Registration, asset_id, user_id, action, details);
    
    // Verify log ID is non-zero
    assert(log_id != 0, 'Should return non-zero ID');
    
    // Get log and verify data
    let log = state.get_audit_log(log_id);
    assert(log.event_type == EventType::Registration, 'Wrong event type');
    assert(log.asset_id == asset_id, 'Wrong asset ID');
    assert(log.user_id == user_id, 'Wrong user ID');
    assert(log.action == action, 'Wrong action');
    assert(log.details == details, 'Wrong details');
    assert(log.timestamp == current_time, 'Wrong timestamp');
    assert(!log.verified, 'Should not be verified');
    
    // Verify asset audit trail
    let asset_trail = state.get_asset_audit_trail(asset_id);
    assert(asset_trail.len() == 1, 'Should have 1 log for asset');
    assert(asset_trail[0].log_id == log_id, 'Wrong log in asset trail');
    
    // Verify user audit trail
    let user_trail = state.get_user_audit_trail(user_id);
    assert(user_trail.len() == 1, 'Should have 1 log for user');
    assert(user_trail[0].log_id == log_id, 'Wrong log in user trail');
}

#[test]
fn test_verify_audit_log() {
    // Initialize component
    let mut state = AuditTrailComponent::component_state_for_testing();
    
    // Set up test data
    let admin = create_address(1);
    let verifier = create_address(2);
    let asset_id = 123;
    let user_id = 456;
    let action = 'register';
    let details = 'Asset registration';
    let current_time = 1000u64;
    
    // Set current time and caller
    set_timestamp(current_time);
    set_caller(admin);
    
    // Add verifier
    state.add_verifier(verifier);
    
    // Create audit log
    let log_id = state.create_audit_log(EventType::Registration, asset_id, user_id, action, details);
    
    // Set caller to verifier
    set_caller(verifier);
    
    // Verify audit log
    state.verify_audit_log(log_id);
    
    // Get log and verify it's verified
    let log = state.get_audit_log(log_id);
    assert(log.verified, 'Should be verified');
    assert(log.verifier == verifier, 'Wrong verifier');
}

#[test]
fn test_verify_audit_chain() {
    // Initialize component
    let mut state = AuditTrailComponent::component_state_for_testing();
    
    // Set up test data
    let admin = create_address(1);
    let asset_id = 123;
    let user_id = 456;
    let current_time = 1000u64;
    
    // Set current time and caller
    set_timestamp(current_time);
    set_caller(admin);
    
    // Create multiple audit logs
    let log_id1 = state.create_audit_log(EventType::Registration, asset_id, user_id, 'register', 'Registration');
    
    set_timestamp(current_time + 100);
    let log_id2 = state.create_audit_log(EventType::Transfer, asset_id, user_id, 'transfer', 'Transfer');
    
    set_timestamp(current_time + 200);
    let log_id3 = state.create_audit_log(EventType::Maintenance, asset_id, user_id, 'maintain', 'Maintenance');
    
    // Verify chain integrity
    let chain_valid = state.verify_audit_chain(0, 3);
    assert(chain_valid, 'Chain should be valid');
}

#[test]
#[should_panic(expected: ('Not authorized verifier',))]
fn test_verify_not_authorized() {
    // Initialize component
    let mut state = AuditTrailComponent::component_state_for_testing();
    
    // Set up test data
    let admin = create_address(1);
    let not_verifier = create_address(2);
    let asset_id = 123;
    let user_id = 456;
    let current_time = 1000u64;
    
    // Set current time and caller
    set_timestamp(current_time);
    set_caller(admin);
    
    // Create audit log
    let log_id = state.create_audit_log(EventType::Registration, asset_id, user_id, 'register', 'Registration');
    
    // Set caller to non-verifier
    set_caller(not_verifier);
    
    // Try to verify as non-verifier
    state.verify_audit_log(log_id);
}

#[test]
#[should_panic(expected: ('Already verified',))]
fn test_verify_already_verified() {
    // Initialize component
    let mut state = AuditTrailComponent::component_state_for_testing();
    
    // Set up test data
    let admin = create_address(1);
    let verifier = create_address(2);
    let asset_id = 123;
    let user_id = 456;
    let current_time = 1000u64;
    
    // Set current time and caller
    set_timestamp(current_time);
    set_caller(admin);
    
    // Add verifier
    state.add_verifier(verifier);
    
    // Create audit log
    let log_id = state.create_audit_log(EventType::Registration, asset_id, user_id, 'register', 'Registration');
    
    // Set caller to verifier
    set_caller(verifier);
    
    // Verify audit log
    state.verify_audit_log(log_id);
    
    // Try to verify again
    state.verify_audit_log(log_id);
}
