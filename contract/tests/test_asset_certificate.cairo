use starknet::{ContractAddress, contract_address_const, get_caller_address, get_block_timestamp};
use starknet::testing::{set_caller_address, set_block_timestamp};
use manage_assets::interfaces::{AssetInfo, AssetStatus, AssetEvent, EventType, AssetCertificate, CertificateMetadata};
use manage_assets::asset_registry::AssetRegistryComponent;
use manage_assets::asset_certificate::AssetCertificateComponent;
use manage_assets::tests::test_utils::{create_address, set_caller, set_timestamp, create_test_asset_info, create_test_certificate_metadata, assert_event_emitted};

// Helper function to set up test environment
fn setup() -> (AssetRegistryComponent::ComponentState<'static>, AssetCertificateComponent::ComponentState<'static>) {
    let mut registry_state = AssetRegistryComponent::component_state_for_testing();
    let certificate_state = AssetCertificateComponent::component_state_for_testing();
    
    // Register a test asset
    let admin = create_address(1);
    set_caller(admin);
    
    let asset_id = 123;
    let asset_hash = 456;
    let serial_number = 789;
    
    registry_state.register_asset(asset_hash, asset_id, serial_number);
    
    (registry_state, certificate_state)
}

#[test]
fn test_issue_certificate() {
    // Set up test environment
    let (registry_state, mut certificate_state) = setup();
    
    let asset_id = 123;
    let admin = create_address(1);
    let current_time = 1000u64;
    
    // Set current time and caller
    set_timestamp(current_time);
    set_caller(admin);
    
    // Create metadata
    let metadata = create_test_certificate_metadata('High Value Asset', 1000000);
    
    // Issue certificate
    let certificate_id = certificate_state.issue_certificate(asset_id, metadata);
    
    // Verify certificate ID is non-zero
    assert(certificate_id != 0, 'Should return non-zero ID');
    
    // Get certificate and verify data
    let (certificate, cert_metadata) = certificate_state.get_certificate(certificate_id);
    assert(certificate.asset_id == asset_id, 'Wrong asset ID');
    assert(certificate.issue_date == current_time, 'Wrong issue date');
    assert(certificate.issuer == admin, 'Wrong issuer');
    assert(certificate.is_active, 'Should be active');
    
    // Verify metadata
    assert(cert_metadata.name == metadata.name, 'Wrong name');
    assert(cert_metadata.value == metadata.value, 'Wrong value');
    
    // Verify owner
    let owner = certificate_state.get_certificate_owner(certificate_id);
    assert(owner == admin, 'Wrong owner');
    
    // Verify owner certificates
    let owner_certificates = certificate_state.get_owner_certificates(admin);
    assert(owner_certificates.len() == 1, 'Should have 1 certificate');
    assert(owner_certificates[0] == certificate_id, 'Wrong certificate ID');
    
    // Verify certificate exists
    assert(certificate_state.verify_certificate(certificate_id), 'Certificate should be valid');
}

#[test]
fn test_transfer_certificate() {
    // Set up test environment
    let (registry_state, mut certificate_state) = setup();
    
    let asset_id = 123;
    let admin = create_address(1);
    let new_owner = create_address(2);
    let current_time = 1000u64;
    
    // Set current time and caller
    set_timestamp(current_time);
    set_caller(admin);
    
    // Create metadata
    let metadata = create_test_certificate_metadata('High Value Asset', 1000000);
    
    // Issue certificate
    let certificate_id = certificate_state.issue_certificate(asset_id, metadata);
    
    // Transfer certificate
    certificate_state.transfer_certificate(certificate_id, new_owner);
    
    // Verify new owner
    let owner = certificate_state.get_certificate_owner(certificate_id);
    assert(owner == new_owner, 'Wrong owner after transfer');
    
    // Verify owner certificates
    let owner_certificates = certificate_state.get_owner_certificates(new_owner);
    assert(owner_certificates.len() == 1, 'New owner should have 1 certificate');
    assert(owner_certificates[0] == certificate_id, 'Wrong certificate ID');
}

#[test]
fn test_revoke_certificate() {
    // Set up test environment
    let (registry_state, mut certificate_state) = setup();
    
    let asset_id = 123;
    let admin = create_address(1);
    let current_time = 1000u64;
    
    // Set current time and caller
    set_timestamp(current_time);
    set_caller(admin);
    
    // Create metadata
    let metadata = create_test_certificate_metadata('High Value Asset', 1000000);
    
    // Issue certificate
    let certificate_id = certificate_state.issue_certificate(asset_id, metadata);
    
    // Revoke certificate
    let reason = 'Asset sold';
    certificate_state.revoke_certificate(certificate_id, reason);
    
    // Verify certificate is not active
    let (certificate, _) = certificate_state.get_certificate(certificate_id);
    assert(!certificate.is_active, 'Certificate should be inactive');
    
    // Verify certificate verification fails
    assert(!certificate_state.verify_certificate(certificate_id), 'Certificate should be invalid');
}

#[test]
#[should_panic(expected: ('Not certificate owner',))]
fn test_transfer_not_owner() {
    // Set up test environment
    let (registry_state, mut certificate_state) = setup();
    
    let asset_id = 123;
    let admin = create_address(1);
    let not_owner = create_address(2);
    let new_owner = create_address(3);
    let current_time = 1000u64;
    
    // Set current time and caller
    set_timestamp(current_time);
    set_caller(admin);
    
    // Create metadata
    let metadata = create_test_certificate_metadata('High Value Asset', 1000000);
    
    // Issue certificate
    let certificate_id = certificate_state.issue_certificate(asset_id, metadata);
    
    // Set caller to not owner
    set_caller(not_owner);
    
    // Try to transfer certificate as non-owner
    certificate_state.transfer_certificate(certificate_id, new_owner);
}

#[test]
#[should_panic(expected: ('Not certificate issuer',))]
fn test_revoke_not_issuer() {
    // Set up test environment
    let (registry_state, mut certificate_state) = setup();
    
    let asset_id = 123;
    let admin = create_address(1);
    let not_issuer = create_address(2);
    let current_time = 1000u64;
    
    // Set current time and caller
    set_timestamp(current_time);
    set_caller(admin);
    
    // Create metadata
    let metadata = create_test_certificate_metadata('High Value Asset', 1000000);
    
    // Issue certificate
    let certificate_id = certificate_state.issue_certificate(asset_id, metadata);
    
    // Set caller to not issuer
    set_caller(not_issuer);
    
    // Try to revoke certificate as non-issuer
    certificate_state.revoke_certificate(certificate_id, 'Unauthorized revocation');
}
