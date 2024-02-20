import React, { Component } from "react";
import * as d3 from "d3";
import "./basic.css";
import axios from "axios";
import InfoPanelMovie from "./InfoPanelMovie";
import InfoPanelCharacter from "./InfoPanelCharacter";
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
let url ="";
let apiKey = "";

let cache = {};
class NewGraph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            name: props.name,
            type: props.type,
            nodes: {},
            links: []
        };
        console.log(process.env.REACT_APP_API_KEY);

        url = process.env.REACT_APP_API_URL;
        apiKey = process.env.REACT_APP_API_KEY;
        axios.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
        /*        
        Select movie, display quotes/char pair by movieID 
        Select character , display quotes/movie pair by character        
        */
    }

    componentWillUnmount() {
        this.force.stop();
    }

    async getMovies() {
        let moviesRaw = await axios.get(url + "movie");
        const data = moviesRaw.data.docs;
        const movies = data.map(p => {
            return {
                name: p.name, id: p._id, type: "Movie", boxOffice: p.boxOfficeRevenueInMillions, academyAwardWins: p.academyAwardWins, academyAwardNominations: p.academyAwardNominations
            };
        });
        return movies;
    }

    async getQuotesByCharAndMovie(charId, movieId) {
        let quoteRaw = await axios.get(url + `quote?movie=${movieId}&character=${charId}&page=1&limit=20`);
        const data = quoteRaw.data.docs;
        const quotes = data.map(p => {
            return {
                dialog: p.dialog, id: p._id, character: p.character, characterName: '', type: 'Quote', movieId: p.movie
            };
        });
        return await this.addCharToQuotes(quotes);
    }

    async getCharById(id) {
        if (cache[id]) {
            console.log("cache hit for char");
            return cache[id];
        }
        let char = await axios.get(url + `character/${id}/`);
        console.log('char', char);
        cache[id] = char?.data.docs[0];
        return char?.data.docs[0];
    }

    async addCharToQuotes(quotes) {
        for (const q of quotes) {
            let char = await this.getCharById(q.character);
            q.characterName = char.name;
            q.characterWiki = char.wikiUrl;
            q.characterRealm = char.realm;
            q.characterRace = char.race;
            console.log(q.character, q.characterName);
        }
        return quotes;
    }

    async getQuotesByMovie(movieId) {
        let quoteRaw = await axios.get(url + `movie/${movieId}/quote?page=1&limit=20`);
        const data = quoteRaw.data.docs;
        console.log("quotes by movie", data);
        const quotes = data.map(p => {
            return {
                dialog: p.dialog, id: p._id, character: p.character, characterName: '', type: 'Quote'
            };
        });
        console.log("q by movie", quotes);
        return await this.addCharToQuotes(quotes);
    }

    async updateGraph() {
        d3.select(".uxmessage").text('Loading relevant quotes  of ' + this.state.name + ' ..');
        let n;
        console.log("state", this.state);
        if (this.state.type == "Movies") {
            console.log("getting all movies");
            n = await this.getMovies();
        }
        else if (this.state.type == "Movie") {
            console.log("getting  quotes by a movie");
            if (this.state.character != undefined)
                n = await this.getQuotesByCharAndMovie(this.state.character, this.state.movieId);
            else {
                n = await this.getQuotesByMovie(this.state.id);
            }
        }
        else if (this.state.type == "Quote") {
            console.log("getting  quotes by a character and a movie");
            n = await this.getQuotesByCharAndMovie(this.state.character, this.state.movieId);
        }

        d3.select(".uxmessage").text('');
        console.log("n", n);

        this.setState({ nodes: n });

        let width = this.props.width, height = this.props.height;

        let svg = d3
            .select(".container")
            .attr("width", width)
            .attr("height", height);

        let links2 = [];

        for (let x = 0; x < this.state.nodes.length - 1; x++) {
            links2.push({ source: 0, target: x + 1 });
        }

        let force = d3.layout
            .force()
            .size([width, height])
            .nodes(this.state.nodes)
            .links(links2)
            .linkDistance(350)
            .charge(-1000)
            .start();

        force.on("tick", function () {
            node.attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        });

        svg.selectAll(".node").remove();
        svg.select(".nodeParent").remove();
        let message = "message";
        function getText(d) {

            if (d.type == 'Movie') {
                message = `loading relevant quotes of: " + ${d.name}`;
                return `${d.name}`;
            }
            else if (d.type == 'Quote') {
                message = `loading relevant quotes of: " + ${d.characterName}`;
                return `${d.dialog} by ${d.characterName}`;
            }
        }

        let node = svg
            .selectAll(".node")
            .data(force.nodes())
            .enter()
            .append("text")
            .text(d => getText(d))
            .attr("class", d => { return d.index === 0 ? "nodeParent" : "node" })
            .on("click", d => {
                console.log("d is set to state", d);
                this.setState({
                    id: d.id,
                    name: d.name,
                    type: d.type,
                });

                if (d.type == 'Movie') {
                    this.setState({
                        movie: d.name,
                        movieId: d.id,
                        movieBoxOffice: d.boxOffice,
                        movieAcademyAwardWins: d.academyAwardWins,
                        movieAcademyAwardNominations: d.academyAwardNominations
                    });
                }
                else if (d.type == 'Quote') {
                    this.setState({
                        characterName: d.characterName,
                        character: d.character,
                        characterRealm: d.characterRealm,
                        characterRace: d.characterRace,
                        characterWiki: d.characterWiki
                    });
                }
                this.updateGraph();
            });
    }


    componentDidMount() {
        this.updateGraph();
    }

    render() {
        if (this.state.nodes)
            return (

                <Grid container spacing={2}>
                    <Grid item xs={4}>
                    </Grid>

                    <Grid item xs={2}>
                        {this.state.character && <InfoPanelCharacter name={this.state.characterName} wiki={this.state.characterWiki} realm={this.state.characterRealm} race={this.state.characterRace} />}
                    </Grid>
                    <Grid item xs={2}>
                        {this.state.movie && <InfoPanelMovie title={this.state.movie} academyAwardNominations={this.state.movieAcademyAwardNominations}
                            academyAwardWins={this.state.movieAcademyAwardWins} boxOffice={this.state.movieBoxOffice} />}
                    </Grid>
                    <Grid item xs={4}>

                    </Grid>

                    <Grid item xs={12}>
                        <Button variant="contained"
                            onClick={() => { this.setState({ character: '', characterName: '', movie: '', movieId: '', id: '', type: 'Movies', nodes: {} }); console.log("state after reset", this.state); this.updateGraph(); }
                            }
                        >Reset</Button>
                        <div className="uxmessage"></div>
                        <svg
                            className="container"
                            width={this.props.width}
                            height={this.props.height}
                        />
                    </Grid>
                </Grid>
            );
        else return <div>
            'Loading quotes  of '+ {this.props.name}
        </div>
    }
}

export default NewGraph;