import React, { Component } from "react";


import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';



class InfoPanelMovie extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        //if (this.state.character)
        return (



            <Card sx={{ minWidth: 100, maxWidth: 250 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        {this.props.title}
                    </Typography>
                    <Typography variant="body2" component="div" align="left">
                        Academy Award Nominations:{ this.props.academyAwardNominations }
                        <br />
                        Academy Award Wins:{this.props.academyAwardWins}
                        <br />
                        Box Office:{this.props.boxOffice} million $
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button size="xsmall">Get Quotes</Button>
                </CardActions>
            </Card>


        );
    }
}


export default InfoPanelMovie;