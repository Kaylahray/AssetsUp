use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum ContractError {
    AssetAlreadyExists = 1,
    AssetNotFound = 2,
    BranchAlreadyExists = 3,
    BranchNotFound = 4,
    Unauthorized = 5,
}
