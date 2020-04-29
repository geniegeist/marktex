import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { database } from './../Firebase.js';

class DocumentDirectory extends Component {

    db = database()

    constructor(props) {
        super(props);
        this.state = { documentIds: [] }
    }
 
    componentDidMount() {
        this.db.ref('documents').on('value', snapshot => {
            const documentIds = snapshot.val();
            this.setState({ documentIds });
        });
    }

    render() {
        const { documentIds } = this.state;
        const documents = Object.keys(documentIds).map(key => {
            const docId = documentIds[key];
            return (
                <li key={key}>
                    <Link to={`/doc/${docId}`}>
                        {docId}
                    </Link>
                </li>
            );
        });

        return (
            <ul style={{textAlign: "left"}}>
                {documents}
            </ul>
        );
    }
}

export default DocumentDirectory;