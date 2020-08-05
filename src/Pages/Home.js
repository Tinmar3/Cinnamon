import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default class Home extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pokemonItems: [],
      paginationList: [],
      paginationActive: 1,
      searchValue: ''
    }
    this.ITEMS_LIMIT_PER_PAGE = 100
    this.allPokemonItemsCount = null
    this.allPokemonItems = []
  }

  componentDidMount () {
    this.apiListingBuilder()
      .then(res => {
        this.allPokemonItemsCount = res.data.count
        this.setState({ pokemonItems: res.data.results, paginationList: this.getPaginationList(this.allPokemonItemsCount) })
      }).catch(err => console.error(err))
  }

  apiListingBuilder ({ paginationNumber, showAll } = {}) {
    const params = new URLSearchParams()
    showAll ? params.append('limit', this.allPokemonItemsCount) : params.append('limit', this.ITEMS_LIMIT_PER_PAGE)
    paginationNumber && paginationNumber > 1 && params.append('offset', this.ITEMS_LIMIT_PER_PAGE * (paginationNumber - 1))
    return axios.get('https://pokeapi.co/api/v2/pokemon', { params: params })
  }

  getPaginationList (pokemonItemsCount) {
    const pagesNumber = Math.ceil(pokemonItemsCount / this.ITEMS_LIMIT_PER_PAGE)
    const paginationList = []
    for (let i = 1; i <= pagesNumber; i++) paginationList.push(i)
    return paginationList
  }

  handlePaginationClick = paginationNumber => {
    const { paginationActive, searchValue } = this.state
    if (paginationNumber !== paginationActive) {
      if (!searchValue) {
        this.apiListingBuilder({ paginationNumber })
          .then(res => {
            this.setState({ pokemonItems: res.data.results, paginationActive: paginationNumber })
          }).catch(err => console.error(err))
      } else {
        const offset = this.ITEMS_LIMIT_PER_PAGE * (paginationNumber - 1)
        const pokemonItems = this.allPokemonItems.filter(pokemonItem => pokemonItem.name.includes(searchValue)).slice(offset, offset + this.ITEMS_LIMIT_PER_PAGE)
        this.setState({ pokemonItems, paginationActive: paginationNumber })
      }
    }
  }

  handleShowAllClick = () => {
    this.apiListingBuilder({ showAll: true })
      .then(res => {
        this.setState({ pokemonItems: res.data.results, paginationActive: null })
      }).catch(err => console.error(err))
  }

  handleSearchChange = event => {
    this.setState({ searchValue: event.target.value })
  }

  async handleSearchClick () {
    const { searchValue } = this.state
    if (!this.allPokemonItems.length) {
      try {
        const response = await this.apiListingBuilder({ showAll: true })
        this.allPokemonItems = response.data.results
      } catch ({ response }) {
        console.err(response)
      }
    }
    const searchedPokemonItems = this.allPokemonItems.filter(pokemonItem => pokemonItem.name.includes(searchValue))
    this.setState({ pokemonItems: searchedPokemonItems.slice(0, 100), paginationActive: 1, paginationList: this.getPaginationList(searchedPokemonItems.length) })
  }

  render () {
    const { pokemonItems, paginationList, paginationActive, searchValue } = this.state
    return (
      <div>
        <h1>Pokemon browse!</h1>
        <section>
          <input type="text" value={searchValue} onChange={this.handleSearchChange} />
          <button onClick={this.handleSearchClick.bind(this)}>Search</button>
        </section>
        {pokemonItems.length && <ul>
          {pokemonItems.map(pokemonItem =>
            <li key={pokemonItem.name}> <Link to={'pokemonDetails/' + pokemonItem.name}>{pokemonItem.name}</Link> </li>
          )}
        </ul>}
        {paginationList.length && paginationActive && <ul>
          {paginationList.map(num =>
            <li key={num} onClick={() => this.handlePaginationClick(num)}>Page {num}</li>
          )}
        </ul>}
        {paginationActive && <button onClick={this.handleShowAllClick}>SHOW ALL</button>}
      </div>
    )
  }
}
