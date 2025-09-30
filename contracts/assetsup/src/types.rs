#![allow(clippy::upper_case_acronyms)]
use soroban_sdk::{contracttype};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum AssetType {
    IT,
    Furniture,
    Vehicle,
    RealEstate,
    Machinery,
    Other,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum AssetStatus {
    Active,
    Maintenance,
    Retired,
    Disposed,
}
