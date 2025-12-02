export interface Reward {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    cost: number;
    redeemedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
