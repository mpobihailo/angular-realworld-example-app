/// <reference types='cypress' />

describe('Test with backend', () => {
  
  beforeEach('login to application', () => {
    cy.intercept({method: 'Get', path: '**/tags'}, {fixture: 'tags.json'});

    cy.loginToApplication();
})
  
  it('should verify correct request and response', () => {

    cy.intercept('POST', 'https://api.realworld.io/api/articles/')
      .as('postArticles');

    cy.conteins('New Article')
      .click();
    cy.findByPlaceholder('Article Title')
      .type('This is title');
    cy.findByPlaceholder('What\'s this article about?')
      .type('This is a description');
    cy.findByPlaceholder('Write your article (in markdown)')
      .type('This is a body of the article');
    cy.contains('button', 'Publish Article')
      .click();

    cy.wait('@postArticles')
      .then(xhr => {
        console.log(xhr);
        expect(xhr.response.statusCode)
          .to.equal(200);
        expect(xhr.request.body.article.body)
          .to.equal('This is a body of the article');
        expect(xhr.response.body.article.description)
          .to.equal('This is a description'); 
      });
  });

  it('intercepting and modifying the request and response', () => {

    // cy.intercept('POST', '**/articles/', (req) => {
    //   req.body.article.description = "This is a description"
    // }).as('postArticles');

    cy.intercept('POST', '**/articles/', (req) => {
      req.reply(res => {
        expect(res.body.article.description)
          .to.equal('This is a description');
      })
    }).as('postArticles');

    cy.conteins('New Article')
      .click();
    cy.findByPlaceholder('Article Title')
      .type('This is title');
    cy.findByPlaceholder('What\'s this article about?')
      .type('This is a description');
    cy.findByPlaceholder('Write your article (in markdown)')
      .type('This is a body of the article');
    cy.contains('button', 'Publish Article')
      .click();

    cy.wait('@postArticles')
      .then(xhr => {
        console.log(xhr);
        expect(xhr.response.statusCode)
          .to.equal(200);
        expect(xhr.request.body.article.body)
          .to.equal('This is a body of the article');
        expect(xhr.response.body.article.description)
          .to.equal('This is a description'); 
      });
  });


  it ('should verify popular tags are displayed', () => {
    cy.get('.tag-list')
      .should('contain', 'cypress')
      .and('contain', 'automation')
      .and('contain', 'testing')
  })

  it('should verify global feed likes count', () => {
    cy.intercept('GET', 'https://api.realworld.io/api/articles/feed*', {"articles":[],"articlesCount":0});
    cy.intercept('GET', 'https://api.realworld.io/api/articles*', { fixture: 'articles.json'});

    cy.contains('Global Feed').click();
    cy.get('app-article-list button').then(heartList => {
        expect(heartList[0]).to.contain('1');
        expect(heartList[1]).to.contain('5');
    })

    cy.fixture('articles').then(file => {
        const articleLink = file.articles[1].slug;
        file.articles[1].favoritesCount = 6;
        cy.intercept('POST', 'https://api.realworld.io/api/articles/'+articleLink+'/favorite', file);
    })

    cy.get('app-article-list button')
      .eq(1)
      .click()
      .should('contain', '6');

  })

  it('should delete a new artucle in a global feed', () => {

    const bodyRequest = {
      "article": {
          "tagList": [],
          "title": "Request from API",
          "description": "API testing is easy",
          "body": "Angular is cool"
      }
  }

    cy.get('@token')
      .then(token => {

        cy.request({
          url: 'https://api.realworld.io/api/articles/',
          headers: { 'Authorization': 'Token ' +token },
          method: 'POST',
          body: bodyRequest
        }).then( response => {
          espect(response,status)
            .to.equal(200)
        });

        cy.contains('Global Feed')
          .click();
        cy.get('.article-preview')
          .first()
          .click();
        cy.get('.article-actions')
          .contain('Delete Article')
          .click();

        cy.request({
          url: 'https://api.realworld.io/api/articles?limit=10&offset=0',
          headers: { 'Authorization': 'Token ' +token },
          method: 'GET',
        }).its('body').then( body => {
          expect(body.articles[0].title).not.to.equal('Request from API');
        })
      })
  })
});