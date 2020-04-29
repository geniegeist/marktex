import React, { Component } from 'react';
import * as Showdown from 'showdown';
import Editor from './Editor/Editor.js';
import { database } from './../Firebase.js';
import './NewDocumentPage.css';
import ReactToPrint from 'react-to-print';
import { withRouter } from 'react-router-dom';
import showdownKatex from 'showdown-katex';
import 'katex/dist/katex.min.css';

Showdown.extension('targetlink', function () {
    return [{
        type: 'html',
        regex: /(<a [^>]+?)(>.*<\/a>)/g,
        replace: '$1 target="_blank"$2'
    }];
});

const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,
    extensions: ['targetlink', showdownKatex({
        // maybe you want katex to throwOnError
        throwOnError: false,
        // disable displayMode
        displayMode: true,
        // change errorColor to blue
        errorColor: '#1500ff',
        delimiters: [
            { left: "$", right: "$", display: false },
            { left: "€", right: "€", display: true }
        ]
    })]
});

const initialValue = "# Willkommen zu ErstiTex!\r\n\r\nHey! Dies ist dein erstes Dokument in `ErstiTex`. Mit diesem Editor kannst du einfach **Mathehausaufgaben** schreiben. Du kannst Formeln darstellen wie zum Beispiel\r\n$$\r\n  \\sum^n_{i=1} i = \\frac{n(n+1)}{2}.\r\n$$\r\n\r\n--- \r\n\r\n## Mathematische Formeln schreiben\r\n\r\nMit dem Dollarzeichen `$` schreibst du mathematische Ausdr\u00FCcke. Hier einige Beispiele:\r\n\r\n* `$f(x) = x^2 - \\frac{1}{2}$` ergibt $f(x) = x^2 - \\frac{1}{2}$\r\n* `$\\lim_{n \\to \\infty} x$` wird zu $\\lim_{n \\to \\infty} x$\r\n* `$$\\lim_{x \\to 0}\\sin(\\alpha x^2)$$` ergibt $$\\lim_{x \\to 0}\\sin(\\alpha x^2)$$\r\n\r\nIm letzten Beispiel benutzten wir `$$`; in diesem Fall wird die Formel *zentriert* und *in einer neuen Zeile dargestellt*.\r\n\r\n### Wichtige Kommandos\r\n\r\n* Reelle Zahlen, ganze Zahlen, ... (z.B. $\\R, \\Z, \\Q$): `$\\R, \\Z, \\Q$`\r\n* Griechische Buchstaben ($\\alpha, \\beta, \\gamma$): `$\\alpha, \\beta, \\gamma$`\r\n* Integrale ($\\int^{a}_{b} f(x) dx$): `\\int^{a}_{b} f(x) dx`\r\n\r\n**Falls ihr ein Zeichen sucht:** [Detexify](http://detexify.kirelabs.org/classify.html)\r\n\r\n\r\n---\r\n\r\n## Listen\r\n\r\nDu kannst auch ***Listen*** anfertigen, wie zum Beispiel\r\n\r\n* Brot,\r\n* Schinken,\r\n* K\u00E4se.\r\n \r\nOder doch eher eine *numerierte Liste*?\r\n\r\n1. Induktionsanfang: Sei $n = 0$.\r\n2. Induktionsbehauptung: Sei $n \\in \\N$ beliebig.\r\n3. Induktionsschritt: $n \\leadsto n + 1$"

class NewDocumentPage extends Component {

    db = database();

    constructor(props) {
        super(props);

        this.state = {
            editorValue: "",
            htmlValue: "",
            hasUnsavedChanges: false
        };

        this.handleOnChangeEditor = this.handleOnChangeEditor.bind(this);
        this.handleOnSave = this.handleOnSave.bind(this);
    }

    handleOnChangeEditor(value) {
        this.setState({ editorValue: value, hasUnsavedChanges: true }, () => {

        });

        if (parseMarkTex(value)) {
            this.setState({ htmlValue: converter.makeHtml(value) });
        }


    }

    handleOnSave() {
        this.setState({ hasUnsavedChanges: false });
        let docId = this.props.match.params.documentId;

        if (!docId) {
            return;
        }

        let updates = {};
        updates[docId] = this.state.editorValue;
        this.db.ref().update(updates);
    }

    componentDidMount() {
        let docId = this.props.match.params.documentId;
        if (docId) {
            this.db.ref(docId).on('value', snapshot => {
                if (snapshot.exists()) {
                    const editorValue = snapshot.val();
                    this.setState((state, props) => {
                        let { htmlValue } = state;
                        if (parseMarkTex(editorValue)) {
                            htmlValue = converter.makeHtml(editorValue);
                        }
                        return { editorValue, htmlValue };
                    });                    
                } else {
                    this.setState({ editorValue: initialValue });
                    this.db.ref("documents").push(docId);
                    this.db.ref(docId).set(initialValue);
                }
            });
        }

        setInterval(() => {
            if (this.state.hasUnsavedChanges) {
                this.setState({ hasUnsavedChanges: false });

                let updates = {};
                updates[docId] = this.state.editorValue;

                this.db.ref().update(updates);
            }
        }, 10000)
    }

    componentDidUpdate() {
        /*
        if (window.MathJax.typeset) {
            window.MathJax.typeset();
        }
        */
    }

    render() {
        return (
            <div style={{ display: "flex", flexWrap: "wrap", minHeight: "100%" }}>
                <div style={{ ...columnStyle, backgroundColor: "#F5F5F5" }}>
                    <Editor
                        value={this.state.editorValue}
                        onChange={this.handleOnChangeEditor}
                        onSave={this.handleOnSave}
                        hasUnsavedChanges={this.state.hasUnsavedChanges}
                    />
                </div>
                <div style={{ ...columnStyle, backgroundColor: "white", wordBreak: "break-word" }}>
                    <div style={{ display: "flex", margin: "1em 2em 0 0", justifyContent: "flex-end" }}>
                        <ReactToPrint
                            trigger={() => <span style={{ cursor: "pointer", color: "blue" }}>PDF generieren</span>}
                            content={() => this.componentRef}
                            onBeforeGetContent={() => {

                            }}
                        />
                    </div>
                    <div className="previewContainer" dangerouslySetInnerHTML={{ __html: this.state.htmlValue }} ref={el => (this.componentRef = el)}></div>
                </div>
            </div>
        );
    }
}

const parseMarkTex = function (marktex) {
    const regex = RegExp('\\\\begin{[a-zA-Z]+}[\\s\\n]*\\\\end{[a-zA-Z]+}')
    return !regex.test(marktex);
}

const columnStyle = {
    flex: "50%",
    margin: "0",
    padding: "0",
    textAlign: "left",
    maxWidth: "50%",
    width: "50%",
    height: "100vh",
    overflow: "scroll"
};

export default withRouter(NewDocumentPage);