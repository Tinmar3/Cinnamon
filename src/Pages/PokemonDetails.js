/* eslint-disable react/prop-types */
import React, { Component } from 'react'
import { withRouter, Link } from 'react-router-dom'
import queryString from 'query-string'
import axios from 'axios'
import './PokemonDetails.scss'

class PokemonDetails extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pokemonData: {},
      modalPokemonTypeContent: [],
      modalPokemonType: '',
      showLoader: false,
      showModalLoader: false,
      mainImagePresent: undefined,
      errorMessage: false
    }
    this.placeholderURL = 'https://lh3.googleusercontent.com/proxy/QGPIYwd8T5e4L0dGscyhLQDzNgbg5K18eWRvaJifZuf56abi1AlXHKaXhskVEkmuPUi0KRNWLdF7p-ELvq3ZYileETaEDPDiXtimbHsccZvPnC_YMgcZRwifHFftM-C6cg'
  }

  componentDidMount () {
    this.setState({ showLoader: true }, () => {
      axios.get('https://pokeapi.co/api/v2/pokemon/' + this.props.match.params.name)
        .then(res => {
          const { name, types, sprites } = res.data
          this.setState({ pokemonData: { name, types, sprites } })
        }).catch(err => {
          console.error(err)
          this.setState({ errorMessage: true })
        })
      const { search } = this.props.location
      if (search) {
        this.getPokemonTypeData(queryString.parse(search).type)
      }
    })
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
    const { mainImagePresent, pokemonData } = this.state
    if (typeof mainImagePresent === 'undefined') {
      const mainImage = pokemonData.sprites && pokemonData.sprites.front_default
      if (mainImage) {
        this.setState({ mainImagePresent: true })
      } else if (Object.keys(pokemonData).length !== 0 && !mainImage) {
        this.setState({ mainImagePresent: false })
      }
    }
  }

  getPokemonTypeData (type) {
    this.setState({ showModalLoader: true }, () => {
      return axios.get('https://pokeapi.co/api/v2/type/' + type)
        .then(res => {
          this.setState({ modalPokemonTypeContent: res.data.pokemon, modalPokemonType: res.data.name, showModalLoader: false })
        }).catch(err => {
          console.error(err)
          this.setState({ errorMessage: true })
        })
    })
  }

  hideLoader = () => {
    this.setState({ showLoader: false })
  }

  render () {
    const { pokemonData, modalPokemonType, modalPokemonTypeContent, showLoader, showModalLoader, mainImagePresent, errorMessage } = this.state
    return (
      <div className="container">
        {!errorMessage && showLoader && <div className="loader__Wrap"><div className="loader"></div></div>}
        <h1><Link to={'/'}>&lt;</Link> { pokemonData.name }</h1>
        {(mainImagePresent === true) &&
          <img className="pokemonDetailsImg" src={pokemonData.sprites.front_default} alt={pokemonData.name} onLoad={this.hideLoader} /> }
        {(mainImagePresent === false) &&
          <img className="pokemonDetailsImgPlacehold" src={this.placeholderURL} alt="Pokemon placeholder" onLoad={this.hideLoader} onError={this.hideLoader} /> }
        <ul className="pokemonDetailsList">
          <li>
            <h5>Types</h5>
            {pokemonData.types && pokemonData.types.map(typeItem => <Link key={ typeItem.type.name } to={ this.props.history.location.pathname + '?type=' + typeItem.type.name }>{ typeItem.type.name }</Link>)}
          </li>
        </ul>
        {!errorMessage && modalPokemonType && <div className="modal">
          <div className="modal__Inner">
            {showModalLoader ? <div className="loader"></div> : <>
              <Link className="modal__Close" to={ this.props.history.location.pathname }>X</Link>
              <h2>{ 'All ' + modalPokemonType + ' type Pokemons' }</h2>
              <ul>{modalPokemonTypeContent && modalPokemonTypeContent.map(typeItem => <li key={ typeItem.pokemon.name }>{ typeItem.pokemon.name }</li>)}</ul>
            </>}
          </div>
        </div>}
        {errorMessage && <p className="error">Something went wrong, please try again.</p>}
      </div>
    )
  }
}

export default withRouter(PokemonDetails)
