import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt',
    },
    providers: [
        CredentialsProvider({
            type: 'credentials',
            credentials: {},
            async authorize(credentials, req) {
                const { username, password } = credentials as { username: string; password: string };

                try {
                    const user = await prisma.user.findUnique({
                        where: {
                            username: username,
                        },
                    });

                    if (username === user?.username && (await bcrypt.compare(password, user?.password))) {
                        return user;
                    } else {
                        throw new Error('Wrong Username or Password!');
                    }
                } catch (error) {
                    console.log(error);
                    throw new Error('Wrong Username or Password!');
                }
            },
        }),
    ],
    secret: process.env.JWT_SECRET,
    pages: {
        signIn: '/auth/login',
    },
};

export default NextAuth(authOptions);
