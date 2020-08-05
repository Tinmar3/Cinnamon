import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default class Home extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loadedPokemonItems: [],
      paginationList: [],
      paginationActive: 1
    }
    this.ITEMS_LIMIT_PER_PAGE = 100
    this.apiItemsTotalCount = null
  }

  componentDidMount () {
    this.apiListingBuilder()
      .then(res => {
        const pagesNumber = Math.ceil(res.data.count / this.ITEMS_LIMIT_PER_PAGE)
        const paginationList = []
        for (let i = 1; i <= pagesNumber; i++) paginationList.push(i)
        this.apiItemsTotalCount = res.data.count
        this.setState({ loadedPokemonItems: res.data.results, paginationList })
      }).catch(err => console.error(err))
  }

  apiListingBuilder ({ paginationNumber, showAll } = {}) {
    const params = new URLSearchParams()
    showAll ? params.append('limit', this.apiItemsTotalCount) : params.append('limit', this.ITEMS_LIMIT_PER_PAGE)
    paginationNumber && paginationNumber > 1 && params.append('offset', this.ITEMS_LIMIT_PER_PAGE * (paginationNumber - 1))
    return axios.get('https://pokeapi.co/api/v2/pokemon', { params: params })
  }

  handlePaginationClick = paginationNumber => {
    paginationNumber !== this.state.paginationActive && this.apiListingBuilder({ paginationNumber })
      .then(res => {
        this.setState({ loadedPokemonItems: res.data.results, paginationActive: paginationNumber })
      }).catch(err => console.error(err))
  }

  handleShowAllClick = () => {
    this.apiListingBuilder({ showAll: true })
      .then(res => {
        this.setState({ loadedPokemonItems: res.data.results, paginationActive: null })
      }).catch(err => console.error(err))
  }

  render () {
    const { loadedPokemonItems, paginationList } = this.state
    return (
      <div>
        <h1>Pokemon browse!</h1>
        {loadedPokemonItems.length && <ul>
          {loadedPokemonItems.map(pokemonItem =>
            <li key={pokemonItem.name}> <Link to={'pokemonDetails/' + pokemonItem.name}>{pokemonItem.name}</Link> </li>
          )}
        </ul>}
        {paginationList.length && <ul>
          {paginationList.map(num =>
            <li key={num} onClick={() => this.handlePaginationClick(num)}>{num}</li>
          )}
        </ul>}
        <button onClick={this.handleShowAllClick}>SHOW ALL</button>
      </div>
    )
  }
}
