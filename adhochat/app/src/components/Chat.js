import React from 'react';

import * as constants from '../core/constants.js'

import { ChatMessage } from './ChatMessage';
import { MessageInput } from './MessageInput';
import { Header, List } from 'semantic-ui-react'


export class Chat extends React.Component {

    constructor(props) {
        super(props);
        this.findUser = this.findUser.bind(this);
    }

    findUser(userId) {
        var user = this.props.chat.users.find(user => user.id == userId);
        console.log("chat", this.props.chat);
        console.log("looking for", userId)
        return user;
    }

    render() {
        const messages = <List>
            {this.props.chat.messages.map((message, index) =>
                <ChatMessage key={index}
                    content={message.content}
                    user={this.findUser(message.userId)}
                    isOwn={this.props.me.id == message.userId}
                ></ChatMessage>)}
        </List>;

        return (
            <div>
                <Header as='h2'>Chat id: {this.props.chat.title}</Header>
                    {messages}
                <MessageInput chat={this.props.chat} onNewMessage={this.props.sendMessage}></MessageInput>
            </div>
            );
    }
}