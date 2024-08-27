import React from 'react'
import Person from './Person'

function List() {
    const names = ['a','b','c']
    const nameList = names.map(name => <h2>{name}</h2>)
    const persons = [
        {
            id:1,
            name : 'a',
            age : 2,
            skill : 'A'
        },
        {
            id:2,
            name : 'b',
            age : 3,
            skill : 'B'
        },
        {
            id:3,
            name : 'c',
            age : 4,
            skill : 'C'
        }
    ]
    const personList = persons.map(person =>  <Person key={person.id} person = {person} />)
  return (
    <div>
       {/* {
        names.map(x => <h2>{x} </h2>)
       } */}

       {personList}
    </div>
  )
}

export default List