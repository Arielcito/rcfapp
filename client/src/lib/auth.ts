import { prisma } from "@/app/libs/prismaDB";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/auth/signin",
  },
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXT_AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, user, account, profile }) => {

      if (user) {
        token.id = user.id;
      } else if (token.sub) {
        token.id = token.sub;
      }
      
      return token;
    },
    session: async ({ session, token }) => {
      console.log("session", { session, token });
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Jhondoe" },
        password: { label: "Password", type: "password" },
        username: { label: "Username", type: "text", placeholder: "Jhon Doe" },
      },
      async authorize(credentials) {
        console.log('⭐ Iniciando autorización con credenciales:', {
          email: credentials?.email,
          passwordProvided: !!credentials?.password
        });

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Error: Credenciales faltantes');
          throw new Error("Please enter an email or password");
        }

        // check to see if user already exists
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });
        
        console.log('🔍 Usuario encontrado:', {
          encontrado: !!user,
          tienePassword: !!user?.password
        });

        if (!user || !user?.password) {
          console.log('❌ Error: Usuario no encontrado o sin contraseña');
          throw new Error("No user found");
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        
        console.log('🔐 Resultado de comparación de contraseñas:', passwordMatch);

        if (!passwordMatch) {
          console.log('❌ Error: Contraseña incorrecta');
          throw new Error("Incorrect password");
        }

        console.log('✅ Autorización exitosa para el usuario:', user.email);
        return user;
      },
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  // Puedes agregar más opciones de configuración aquí si es necesario
};
