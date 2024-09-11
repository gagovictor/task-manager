import SqlUserRepository from './sql/userRepository';
import CosmosUserRepository from './cosmos/userRepository';
import SqlTaskRepository from './sql/taskRepository';
import CosmosTaskRepository from './cosmos/taskRepository';
import TaskRepository from './taskRepository';
import UserRepository from './userRepository';

class RepositoryFactory {
    static getUserRepository(): UserRepository {
        switch (process.env.DB_DIALECT) {
            case 'cosmosdb':
                return new CosmosUserRepository();
            case 'postgres':
            case 'mssql':
                return new SqlUserRepository();
            default:
                throw new Error('Unsupported database dialect');
        }
    }
    
    static getTaskRepository(): TaskRepository {
        switch (process.env.DB_DIALECT) {
            case 'cosmosdb':
                return new CosmosTaskRepository();
            case 'postgres':
            case 'mssql':
                return new SqlTaskRepository();
            default:
                throw new Error('Unsupported database dialect');
        }
    }
}

export default RepositoryFactory;
