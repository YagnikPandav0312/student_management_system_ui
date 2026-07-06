export const API = {
    providers_api: {
        get_providers: '/providers/get_providers',
        get_provider_by_id: '/providers/get_provider_by_id',
        create_providers: '/providers/create_providers',
        update_providers: '/providers/update_providers',
        delete_provider: '/providers/delete_provider',
    },
    game_type_api: {
        get_game_type: '/gametype/get_game_type',
        get_game_type_by_id: '/gametype/get_game_type_by_id',
        create_game_type: '/gametype/create_game_type',
        update_game_type: '/gametype/update_game_type',
        delete_game_type: '/gametype/delete_game_type',
    },
    device_type_api: {
        get_device_type: '/devicetype/get_device_type',
        get_device_type_by_id: '/devicetype/get_device_type_by_id',
        create_device_type: '/devicetype/create_device_type',
        update_device_type: '/devicetype/update_device_type',
        delete_device_type: '/devicetype/delete_device_type',
    },
    games_api: {
        get_games: '/games/get_game',
        get_game_by_id: '/games/get_game_by_id',
        create_game: '/games/create_game',
        update_game: '/games/update_game',
        delete_game: '/games/delete_game'
    }
}