import React, { Component } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

class Editor extends Component {

    constructor(props) {
        super(props);

        this.inputTextareaRef = React.createRef();
    }

    insertAtCursor(myValue, cursorOffset) {
        const myField = this.inputTextareaRef.current;
        //IE support
        if (document.selection) {
            myField.focus();
            let sel = document.selection.createRange();
            sel.text = myValue;
        } else if (myField.selectionStart || myField.selectionStart === 0) {
            let startPos = myField.selectionStart;
            let endPos = myField.selectionEnd;
            if (this.props.onChange) {
                const value = myField.value.substring(0, startPos)
                    + myValue
                    + myField.value.substring(endPos, myField.value.length);
                myField.value = value;
                myField.focus();
                myField.selectionStart = startPos + myValue.length + cursorOffset;
                myField.selectionEnd = startPos + myValue.length + cursorOffset;
                this.props.onChange(value)
            }
        } else {
            myField.focus();
            if (this.props.onChange) {
                this.props.onChange(myField.value + myValue)
            }
        }
    }

    componentDidUpdate() {

    }



    componentDidMount() {
    }

    render() {
        return (
            <div>
                <div style={{ padding: "1rem", /*borderBottom: "solid 2px #eee"*/ }}>
                    <div style={{ display: "flex" }}>
                        <span
                            style={{ ...ToolbarButtonStyle, paddingLeft: "0", fontWeight: "bold" }}
                            onClick={(evt) => this.insertAtCursor("****", -2)}
                        >
                            Bold
                        </span>
                        <span
                            style={{ ...ToolbarButtonStyle, fontStyle: "italic" }}
                            onClick={(evt) => this.insertAtCursor("**", -1)}
                        >
                            Italic
                        </span>
                        <span
                            style={{ ...ToolbarButtonStyle, color: "#aaaaaa", marginLeft: "auto" }}
                            onClick={() => {if (this.props.onSave) { this.props.onSave() }}}
                        >
                            {this.props.hasUnsavedChanges ? "Änderungen noch nicht gespeichert" : "Gespeichert"}
                        </span> 
                    </div>
                </div>
                <div style={{ padding: "1rem" }}>
                    <TextareaAutosize
                        autoFocus
                        style={TextareaStyle}
                        value={this.props.value}
                        onChange={(evt) => {
                            if (this.props.onChange) {
                                this.props.onChange(evt.target.value)
                            }
                        }}
                        inputRef={this.inputTextareaRef}
                        onKeyDown={(evt) => {
                            console.log(evt.key);
                            if (evt.key === 'Tab') {
                                evt.preventDefault();
                                this.insertAtCursor("\t", 0);
                            }
                        }}
                    />
                </div>

            </div>
        );
    }
}

const ToolbarButtonStyle = {
    padding: "0.5rem",
    fontSize: "1.2rem",
    cursor: "pointer"
}

const TextareaStyle = {
    outline: "none",
    width: "100%",
    border: "none",
    margin: "0.5rem 0 0 0",
    padding: "0",
    resize: "none",
    fontSize: "1.2rem",
    minHeight: "300px",
    backgroundColor: "#F5F5F5",
    lineHeight: "1.5"
}

export default Editor;