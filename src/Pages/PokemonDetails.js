/* eslint-disable react/prop-types */
import React, { Component } from 'react'
import { withRouter, Link } from 'react-router-dom'
import queryString from 'query-string'
import axios from 'axios'

class PokemonDetails extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pokemonData: {},
      modalPokemonTypeContent: [],
      modalPokemonType: ''
    }
  }

  componentDidMount () {
    axios.get('https://pokeapi.co/api/v2/pokemon/' + this.props.match.params.name)
      .then(res => {
        const { name, types, sprites } = res.data
        this.setState({ pokemonData: { name, types, sprites } })
      }).catch(err => console.error(err))
    const { search } = this.props.location
    if (search) {
      this.getPokemonTypeData(queryString.parse(search).type)
    }
  }

  componentDidUpdate (prevProps) {
    const { search } = this.props.location
    if (search !== prevProps.location.search) {
      if (search) {
        this.getPokemonTypeData(queryString.parse(search).type)
      } else {
        // reset Pokemon type data
        this.setState({ modalPokemonTypeContent: [], modalPokemonType: '' })
      }
    }
  }

  getPokemonTypeData (type) {
    return axios.get('https://pokeapi.co/api/v2/type/' + type)
      .then(res => {
        this.setState({ modalPokemonTypeContent: res.data.pokemon, modalPokemonType: res.data.name })
      }).catch(err => console.error(err))
  }

  render () {
    const { pokemonData, modalPokemonType, modalPokemonTypeContent } = this.state
    return (
      <div>
        <Link to={'/'}>Go back</Link>
        <h1>{ pokemonData.name }</h1>
        {pokemonData.sprites ? <img src={pokemonData.sprites.front_default} /> : <span>placeholder</span> }
        <ul>
          <li>
            <h5>Types</h5>
            {pokemonData.types && pokemonData.types.map(typeItem => <Link key={ typeItem.type.name } to={ this.props.history.location.pathname + '?type=' + typeItem.type.name }>{ typeItem.type.name }</Link>)}
          </li>
        </ul>
        {modalPokemonType && <div className="modal">
          <div className="modal__Inner">
            <Link to={ this.props.history.location.pathname }>X</Link>
            <h2>{ 'All ' + modalPokemonType + ' type Pokemons' }</h2>
            <ul>{modalPokemonTypeContent && modalPokemonTypeContent.map(typeItem => <li key={ typeItem.pokemon.name }>{ typeItem.pokemon.name }</li>)}</ul>
          </div>
        </div>}

      </div>
    )
  }
}

export default withRouter(PokemonDetails)
