export interface CarOfferProps {
    _id?: string;
    make: string;
    model: string;
    year: number;
    description: string;
    date?: Date;
    isAvailable: boolean;
    photoPath: string;
    latitude: number;
    longitude: number;
}