import axios from 'axios';

const url = 'http://localhost:5000';


export const saveDoc = (id) => axios.post(`${url}/docs`, {id:id}); 

export const updateDoc = (id) => axios.patch(`${url}/docs`, id);

export const getDoc = (docId,id) => axios.post(`${url}/docs/fetch/` , {docId:docId,id :id});

export const deleteDoc = (id) => axios.delete(`${url}/docs/${id}`);