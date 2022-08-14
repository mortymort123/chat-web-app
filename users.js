const users = [];
const rooms = [];
export const saveUser = (username) => {
    if (users.includes(username)) {
        return { error: `${username} is already taken.` };
    }
    users.push(username);
    console.log(users)
    return { error: null }
}

export const joinRoom = (user, room) => {
    if (rooms[room]) {
        if (!(rooms[room].includes(user))) {
            rooms[room].push(user);
        }
    } else {
        rooms[room] = [user];
    }

    return { users: rooms[room] }
}

// export const getUsersInRoom = (room) => rooms.filter((roomSearch) => roomSearch.room === room);

export const removeUser = (username) => {
    const index = users.findIndex(name => name == username)
    users.splice(index, 1);
}

export const removeUserInRoom = (username, room) => {
    if (rooms[room]) {
        const index = rooms[room].findIndex(name => name == username);
        rooms[room].splice(index, 1);
    }
    return { users: rooms[room] }
}


