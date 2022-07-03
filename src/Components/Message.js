import React from 'react';
import {HStack, Avatar, Text} from'@chakra-ui/react'

function Message({text, uri, user="user"}) {
    return (
        <HStack
            alignSelf={user === 'me' ? "flex-end" : 'flex-start'}
            bg={'gray.100'}
            paddingY={"2"}
            paddingX={user === 'me' ? '4' : '2'}
        >
            {
                user === 'user' && <Avatar uri={uri}/>
            }
            <Text>{text}</Text>
            {
                user === 'me' && <Avatar uri={uri}/>
            }
        </HStack>
    );
}

export default Message;