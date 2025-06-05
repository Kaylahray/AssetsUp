#[starknet::component]
mod AssetCheckoutComponent {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use manage_assets::interfaces::{AssetStatus, AssetEvent, EventType, AssetCheckout};
    
    #[storage]
    struct Storage {
        checkouts: LegacyMap::<felt252, AssetCheckout>,
        checkout_ids: LegacyMap::<felt252, Array<felt252>>,
        user_checkouts: LegacyMap::<felt252, Array<felt252>>,
        active_checkouts: Array<felt252>,
        next_checkout_id: felt252,
    }
    
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        AssetCheckedOut: AssetCheckedOut,
        AssetCheckedIn: AssetCheckedIn,
    }
    
    #[derive(Drop, starknet::Event)]
    struct AssetCheckedOut {
        checkout_id: felt252,
        asset_id: felt252,
        user_id: felt252,
        checkout_time: u64,
        due_time: u64,
        purpose: felt252,
    }
    
    #[derive(Drop, starknet::Event)]
    struct AssetCheckedIn {
        checkout_id: felt252,
        asset_id: felt252,
        user_id: felt252,
        return_time: u64,
        condition_notes: felt252,
    }
    
    #[embeddable_as(AssetCheckoutImpl)]
    impl AssetCheckout<
        TContractState, 
        +HasComponent<TContractState>
    > of manage_assets::interfaces::IAssetCheckout<ComponentState<TContractState>> {
        fn checkout_asset(
            ref self: ComponentState<TContractState>,
            asset_id: felt252,
            user_id: felt252,
            due_time: u64,
            purpose: felt252
        ) -> felt252 {
            // Generate checkout ID
            let checkout_id = self.next_checkout_id.read() + 1;
            self.next_checkout_id.write(checkout_id);
            
            let current_time = get_block_timestamp();
            
            // Create checkout record
            let checkout = AssetCheckout {
                checkout_id: checkout_id,
                asset_id: asset_id,
                user_id: user_id,
                checkout_time: current_time,
                due_time: due_time,
                return_time: 0, // Not returned yet
                status: 'active', // Active checkout
                purpose: purpose,
            };
            
            // Store checkout
            self.checkouts.write(checkout_id, checkout);
            
            // Add to asset's checkouts
            let mut asset_checkouts = self.checkout_ids.read(asset_id);
            asset_checkouts.append(checkout_id);
            self.checkout_ids.write(asset_id, asset_checkouts);
            
            // Add to user's checkouts
            let mut user_checkouts = self.user_checkouts.read(user_id);
            user_checkouts.append(checkout_id);
            self.user_checkouts.write(user_id, user_checkouts);
            
            // Add to active checkouts
            let mut active = self.active_checkouts.read();
            active.append(checkout_id);
            self.active_checkouts.write(active);
            
            // Emit event
            self.emit(AssetCheckedOut {
                checkout_id: checkout_id,
                asset_id: asset_id,
                user_id: user_id,
                checkout_time: current_time,
                due_time: due_time,
                purpose: purpose,
            });
            
            checkout_id
        }
        
        fn checkin_asset(
            ref self: ComponentState<TContractState>,
            checkout_id: felt252,
            condition_notes: felt252
        ) -> felt252 {
            // Get checkout record
            let mut checkout = self.checkouts.read(checkout_id);
            
            // Ensure checkout is active
            assert(checkout.status == 'active' || checkout.status == 'overdue', 'Checkout not active');
            
            let current_time = get_block_timestamp();
            
            // Update checkout record
            checkout.return_time = current_time;
            checkout.status = 'returned';
            self.checkouts.write(checkout_id, checkout);
            
            // Remove from active checkouts
            let mut active = self.active_checkouts.read();
            let mut new_active = ArrayTrait::new();
            let mut i = 0;
            loop {
                if i >= active.len() {
                    break;
                }
                if active[i] != checkout_id {
                    new_active.append(active[i]);
                }
                i += 1;
            }
            self.active_checkouts.write(new_active);
            
            // Emit event
            self.emit(AssetCheckedIn {
                checkout_id: checkout_id,
                asset_id: checkout.asset_id,
                user_id: checkout.user_id,
                return_time: current_time,
                condition_notes: condition_notes,
            });
            
            checkout_id
        }
        
        fn get_asset_checkouts(
            self: @ComponentState<TContractState>,
            asset_id: felt252
        ) -> Array<AssetCheckout> {
            let checkout_ids = self.checkout_ids.read(asset_id);
            let mut checkouts = ArrayTrait::new();
            
            let mut i = 0;
            loop {
                if i >= checkout_ids.len() {
                    break;
                }
                checkouts.append(self.checkouts.read(checkout_ids[i]));
                i += 1;
            }
            
            checkouts
        }
        
        fn get_user_checkouts(
            self: @ComponentState<TContractState>,
            user_id: felt252
        ) -> Array<AssetCheckout> {
            let checkout_ids = self.user_checkouts.read(user_id);
            let mut checkouts = ArrayTrait::new();
            
            let mut i = 0;
            loop {
                if i >= checkout_ids.len() {
                    break;
                }
                checkouts.append(self.checkouts.read(checkout_ids[i]));
                i += 1;
            }
            
            checkouts
        }
        
        fn get_active_checkouts(
            self: @ComponentState<TContractState>
        ) -> Array<AssetCheckout> {
            let active_ids = self.active_checkouts.read();
            let mut checkouts = ArrayTrait::new();
            
            let mut i = 0;
            loop {
                if i >= active_ids.len() {
                    break;
                }
                checkouts.append(self.checkouts.read(active_ids[i]));
                i += 1;
            }
            
            checkouts
        }
        
        fn get_overdue_checkouts(
            self: @ComponentState<TContractState>,
            current_time: u64
        ) -> Array<AssetCheckout> {
            let active_ids = self.active_checkouts.read();
            let mut overdue_checkouts = ArrayTrait::new();
            
            let mut i = 0;
            loop {
                if i >= active_ids.len() {
                    break;
                }
                let checkout = self.checkouts.read(active_ids[i]);
                if checkout.due_time < current_time {
                    overdue_checkouts.append(checkout);
                }
                i += 1;
            }
            
            overdue_checkouts
        }
        
        fn get_checkout(
            self: @ComponentState<TContractState>,
            checkout_id: felt252
        ) -> AssetCheckout {
            self.checkouts.read(checkout_id)
        }
    }
}
