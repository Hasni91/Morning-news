import React, {useState, useEffect} from 'react';
import { Card, Icon, Modal, Button } from 'antd';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import './App.css';
import Nav from './Nav';

const { Meta } = Card;



/* Initialize News API */
//const NewsAPI = require('newsapi');
const APIkey = '920fe1871ec5410289dba3174398da12';


function ScreenArticlesBySource( props ) {

  const [ articles, setArticles ] = useState([]);
  const [ visible, setVisible ] = useState(false);
  const [ articleModal, setArticleModal ] = useState({});

  

  useEffect( () => {
		async function fetchNews () {
			let today = new Date();
			let yesterday = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
			let urlRequestNews = `https://newsapi.org/v2/everything?sources=${props.match.params.id}&from=${yesterday}&apiKey=${APIkey}`;
			let articles = await fetch( urlRequestNews );
			let response = await articles.json();
			if(response.status === 'ok'){			
				articles = response.articles.map( element => {
					return { id: Math.round( Math.random()*10000 ) , ...element };
				})
				setArticles( articles )
			}
		}
		fetchNews();	
	}, [props] );
	
	const showModal = (newsToShow) => {
		setVisible(true);
		setArticleModal(newsToShow);
	}

	const handleOk = e => {
		setVisible( false );
  };

	const CheckLogin = () => {
		console.log( 'token ', props.userToken )
	
		if ( props.userToken === '' ) {
			return <Redirect to='/'/>
		} else { return null }
	}


	var myWishlist = async (article) =>{
		props.addToWishList(article);
		console.log("ma card que je clique",article)
		var back = await fetch('/wishlist',{
			method : "POST",
			headers: {'Content-Type':'application/x-www-form-urlencoded'},
			body: `idArticle=${article.id}&image=${article.urlToImage}&titre=${article.title}&description=${article.description}&contenu=${article.content}&token=${props.userToken}`,
		})
		//var response = back.json(); 
	}

  return (
    <div>
    	<CheckLogin />
   	<Nav />
      <div className="Banner"/>
      <div className="Card" >
			
			{articles.map( (article, i ) => {	
				return(
				
				 <div key={i} style={{display:'flex', justifyContent:'space-around', align:'middle'}}>
					<Card
				      style={{ 
						   width: 300, 
						   margin:'15px', 
						   display:'flex',
						   flexDirection: 'column',
						   justifyContent:'space-between' }}
				      cover={
						   <img
						       alt="example"
						       src={article.urlToImage}
						   />
				      }
				      actions={[
				          <Icon type="read" key="ellipsis2" 
				          	onClick={ () => showModal( 
				          		{title: article.title, source: article.source.name, content: article.content } 
				          	) } />,
				          <Icon type="like" key="ellipsis" onClick={ () => myWishlist( article )}/>
				      ]}
				  	>
						<Meta
						  title={article.title}
						  description={article.description}
						/>
						
					</Card>
				 
					<Modal 
						title={articleModal.source}
						visible={visible}
						onOk={handleOk}
          			onCancel={handleOk}
						footer={[
							<Button key="okButton" type="primary" onClick={handleOk}>
								Ok
							</Button>,
						]}
						
					 >
						<Meta 
						  title={articleModal.title}
						  description={articleModal.content}
						/>
						
					</Modal>
				
 				 </div>
				);				
			} ) }
			
		</div>
    </div> 

  );
}


function mapStateToProps(state) {
  return {
    userToken: state.tokenuser
  }
}

function mapDispatchToProps(dispatch) {
  return {
    addToWishList: function(articleObj) { 
       dispatch( { type: 'addArticle', article: articleObj } ) 
    }
  }
}

export default connect(
    mapStateToProps, 
    mapDispatchToProps
)( ScreenArticlesBySource );



