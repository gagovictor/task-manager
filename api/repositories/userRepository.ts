interface User {
    id: string;
    username: string;
    password: string;
    email: string;
}

interface UserRepository {
    createUser(user: User): Promise<User>;
    getUserById(id: string): Promise<User | null>;
    updateUser(id: string, user: Partial<User>): Promise<User | null>;
    deleteUser(id: string): Promise<User | null>;
    getAllUsers(): Promise<User[]>;
}

export default UserRepository;
