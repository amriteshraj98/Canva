export type Point = { x: number; y: number };

export type Stroke = {
    id: string;
    userId: string;
    points: Point[];
    color: string;
    width: number;
    isErasing: boolean;
};

export type User = {
    id: string;
    username: string;
    itemColor: string;
    cursor: Point;
};

export type DrawStartEvent = {
    userId: string;
    x: number;
    y: number;
    color: string;
    width: number;
};

export type DrawPointEvent = {
    userId: string;
    x: number;
    y: number;
};
