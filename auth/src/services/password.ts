import bcrypt from 'bcryptjs';

export class Password {
    static async toHash(password: string): Promise<string> {
        return await bcrypt.hash(password, 12);
    }

    static async compare(storedPasswd: string, suppliedPassword: string): Promise<boolean> {
        return await bcrypt.compare(suppliedPassword, storedPasswd);
    }
}
