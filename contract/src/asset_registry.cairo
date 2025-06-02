use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
use manage_assets::interfaces::{AssetInfo, AssetStatus, AssetEvent, EventType};

#[starknet::component]
mod AssetRegistryComponent {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use manage_assets::interfaces::{AssetInfo, AssetStatus, AssetEvent, EventType};

    #[storage]
    struct Storage {
        assets: LegacyMap<felt252, AssetInfo>,
        asset_exists: LegacyMap<felt252, bool>,
        asset_events: LegacyMap<(felt252, u32), AssetEvent>,
        asset_event_count: LegacyMap<felt252, u32>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        AssetRegistered: AssetRegistered,
    }

    #[derive(Drop, starknet::Event)]
    struct AssetRegistered {
        asset_id: felt252,
        asset_hash: felt252,
        serial_number: felt252,
        owner: felt252,
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _add_event(
            ref self: ComponentState<'_>, 
            asset_id: felt252, 
            event_type: EventType, 
            data: felt252
        ) {
            let timestamp = get_block_timestamp();
            let event_count = self.asset_event_count.read(asset_id);
            
            let event = AssetEvent {
                event_type,
                timestamp,
                data,
            };
            
            self.asset_events.write((asset_id, event_count), event);
            self.asset_event_count.write(asset_id, event_count + 1);
        }
    }

    #[embeddable_as(AssetRegistryImpl)]
    impl AssetRegistry<
        TContractState, 
        +HasComponent<TContractState>
    > of manage_assets::interfaces::IAssetRegistry<ComponentState<TContractState>> {
        fn register_asset(
            ref self: ComponentState<TContractState>, 
            asset_hash: felt252, 
            asset_id: felt252, 
            serial_number: felt252
        ) -> felt252 {
            // Check if asset already exists
            assert(!self.asset_exists.read(asset_id), 'Asset already registered');
            
            let caller = get_caller_address();
            let timestamp = get_block_timestamp();
            
            // Create asset info
            let asset_info = AssetInfo {
                asset_id,
                serial_number,
                registration_time: timestamp,
                owner: caller.into(),
                status: AssetStatus::Active,
            };
            
            // Store asset info
            self.assets.write(asset_id, asset_info);
            self.asset_exists.write(asset_id, true);
            
            // Add registration event
            self._add_event(asset_id, EventType::Registration, asset_hash);
            
            // Emit event
            self.emit(AssetRegistered {
                asset_id,
                asset_hash,
                serial_number,
                owner: caller.into(),
            });
            
            asset_id
        }
        
        fn get_asset(self: @ComponentState<TContractState>, asset_id: felt252) -> AssetInfo {
            assert(self.asset_exists.read(asset_id), 'Asset does not exist');
            self.assets.read(asset_id)
        }
        
        fn asset_exists(self: @ComponentState<TContractState>, asset_id: felt252) -> bool {
            self.asset_exists.read(asset_id)
        }
    }
}
