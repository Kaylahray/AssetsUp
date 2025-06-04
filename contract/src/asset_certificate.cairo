use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
use manage_assets::interfaces::{AssetInfo, AssetStatus, AssetEvent, EventType};

#[starknet::component]
mod AssetCertificateComponent {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use manage_assets::interfaces::{AssetInfo, AssetStatus, AssetEvent, EventType};
    use manage_assets::asset_registry::AssetRegistryComponent;

    #[storage]
    struct Storage {
        // NFT-like certificate data
        asset_certificates: LegacyMap<felt252, AssetCertificate>,
        certificate_exists: LegacyMap<felt252, bool>,
        certificate_metadata: LegacyMap<felt252, CertificateMetadata>,
        
        // Certificate ownership
        certificate_owner: LegacyMap<felt252, ContractAddress>,
        owner_certificates: LegacyMap<(ContractAddress, u32), felt252>,
        owner_certificate_count: LegacyMap<ContractAddress, u32>,
        
        // High-value asset threshold (in USD cents)
        high_value_threshold: u256,
    }

    #[derive(Copy, Drop, Serde, starknet::Store)]
    struct AssetCertificate {
        certificate_id: felt252,
        asset_id: felt252,
        issue_date: u64,
        issuer: ContractAddress,
        certificate_hash: felt252,
        is_active: bool,
    }

    #[derive(Copy, Drop, Serde, starknet::Store)]
    struct CertificateMetadata {
        name: felt252,
        description: felt252,
        image_uri: felt252,
        attributes: felt252, // JSON string of attributes
        value: u256,
        currency: felt252,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        CertificateIssued: CertificateIssued,
        CertificateTransferred: CertificateTransferred,
        CertificateRevoked: CertificateRevoked,
    }

    #[derive(Drop, starknet::Event)]
    struct CertificateIssued {
        certificate_id: felt252,
        asset_id: felt252,
        owner: ContractAddress,
        value: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct CertificateTransferred {
        certificate_id: felt252,
        from: ContractAddress,
        to: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct CertificateRevoked {
        certificate_id: felt252,
        reason: felt252,
    }

    #[embeddable_as(AssetCertificateImpl)]
    impl AssetCertificate<
        TContractState,
        +HasComponent<TContractState>,
        +AssetRegistryComponent::HasComponent<TContractState>,
    > of manage_assets::interfaces::IAssetCertificate<ComponentState<TContractState>> {
        fn issue_certificate(
            ref self: ComponentState<TContractState>,
            asset_id: felt252,
            metadata: CertificateMetadata,
        ) -> felt252 {
            let caller = get_caller_address();
            let timestamp = get_block_timestamp();
            
            // Generate certificate ID
            let certificate_id = pedersen_hash(asset_id, timestamp);
            
            // Check if certificate already exists
            assert(!self.certificate_exists.read(certificate_id), 'Certificate already exists');
            
            // Create certificate
            let certificate = AssetCertificate {
                certificate_id,
                asset_id,
                issue_date: timestamp,
                issuer: caller,
                certificate_hash: pedersen_hash(metadata.name, metadata.value.into()),
                is_active: true,
            };
            
            // Store certificate data
            self.asset_certificates.write(certificate_id, certificate);
            self.certificate_exists.write(certificate_id, true);
            self.certificate_metadata.write(certificate_id, metadata);
            
            // Set ownership
            self.certificate_owner.write(certificate_id, caller);
            let owner_count = self.owner_certificate_count.read(caller);
            self.owner_certificates.write((caller, owner_count), certificate_id);
            self.owner_certificate_count.write(caller, owner_count + 1);
            
            // Emit event
            self.emit(CertificateIssued {
                certificate_id,
                asset_id,
                owner: caller,
                value: metadata.value,
            });
            
            certificate_id
        }
        
        fn transfer_certificate(
            ref self: ComponentState<TContractState>,
            certificate_id: felt252,
            to: ContractAddress,
        ) {
            let caller = get_caller_address();
            
            // Check ownership
            let current_owner = self.certificate_owner.read(certificate_id);
            assert(current_owner == caller, 'Not certificate owner');
            
            // Check if certificate is active
            let certificate = self.asset_certificates.read(certificate_id);
            assert(certificate.is_active, 'Certificate not active');
            
            // Transfer ownership
            self.certificate_owner.write(certificate_id, to);
            
            // Update new owner's certificate list
            let new_owner_count = self.owner_certificate_count.read(to);
            self.owner_certificates.write((to, new_owner_count), certificate_id);
            self.owner_certificate_count.write(to, new_owner_count + 1);
            
            // Emit event
            self.emit(CertificateTransferred {
                certificate_id,
                from: caller,
                to,
            });
        }
        
        fn revoke_certificate(
            ref self: ComponentState<TContractState>,
            certificate_id: felt252,
            reason: felt252,
        ) {
            let caller = get_caller_address();
            
            // Get certificate
            let mut certificate = self.asset_certificates.read(certificate_id);
            
            // Check if caller is the issuer
            assert(certificate.issuer == caller, 'Not certificate issuer');
            assert(certificate.is_active, 'Certificate already revoked');
            
            // Revoke certificate
            certificate.is_active = false;
            self.asset_certificates.write(certificate_id, certificate);
            
            // Emit event
            self.emit(CertificateRevoked {
                certificate_id,
                reason,
            });
        }
        
        fn get_certificate(
            self: @ComponentState<TContractState>,
            certificate_id: felt252,
        ) -> (AssetCertificate, CertificateMetadata) {
            assert(self.certificate_exists.read(certificate_id), 'Certificate does not exist');
            
            let certificate = self.asset_certificates.read(certificate_id);
            let metadata = self.certificate_metadata.read(certificate_id);
            
            (certificate, metadata)
        }
        
        fn get_certificate_owner(
            self: @ComponentState<TContractState>,
            certificate_id: felt252,
        ) -> ContractAddress {
            self.certificate_owner.read(certificate_id)
        }
        
        fn get_owner_certificates(
            self: @ComponentState<TContractState>,
            owner: ContractAddress,
        ) -> Array<felt252> {
            let count = self.owner_certificate_count.read(owner);
            let mut certificates = ArrayTrait::new();
            
            let mut i: u32 = 0;
            while i < count {
                let certificate_id = self.owner_certificates.read((owner, i));
                certificates.append(certificate_id);
                i += 1;
            }
            
            certificates
        }
        
        fn verify_certificate(
            self: @ComponentState<TContractState>,
            certificate_id: felt252,
        ) -> bool {
            if !self.certificate_exists.read(certificate_id) {
                return false;
            }
            
            let certificate = self.asset_certificates.read(certificate_id);
            certificate.is_active
        }
    }
}
