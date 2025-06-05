import { EntityRepository, Repository } from "typeorm"
import { StockTransaction } from "../entities/stock-transaction.entity"

@EntityRepository(StockTransaction)
export class StockTransactionRepository extends Repository<StockTransaction> {}
