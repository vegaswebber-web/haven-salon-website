export interface Command {
    name: string;
    description: string;
    execute: (args: string[], message: any) => Promise<void>;
}

export interface User {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
}

export interface Channel {
    id: string;
    name: string;
    type: string;
    locked: boolean;
}

export interface Config {
    token: string;
    prefix: string;
}