export type SaveEmblem = {
    type: 'saveEmblem';
    data: {
        wins: number;
        losses: number;
    };
}

export type StartGameMessage = {
    type: 'startGame';
    data: {
        wins: number;
        losses: number;
    };
}