describe('mars rover photo gallery', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/')
  })

  it('check rovers list length', () => {
    // The rover select should contain 3 rovers plus empty option
    cy.get('.rover-select option').should('have.length', 4)
    // Check that the first option is empty and the last is spitit
    cy.get('.rover-select option').first().should('have.text', '')
    cy.get('.rover-select option').last().should('have.text', 'spirit')
  })

  it('select rover camera', () => {
    cy.intercept('GET', '/api/rover/**').as('getManifest')
    // Select curiosity rover
    cy.get('.rover-select').select('curiosity')
    // Wait for manifest response
    cy.wait('@getManifest').its('response.statusCode').should('be.oneOf', [200, 304])
    // There should be 7 cameras plus the empty option
    cy.get('.camera-select option').should('have.length', 8)
    cy.intercept('POST', '/api/photos').as('getPhotos')
    // Select a camera
    cy.get('.camera-select').select('CHEMCAM')
    // Submit the form
    cy.get('.filter-submit').click()
    // Wait for photos response
    cy.wait('@getPhotos').its('response.statusCode').should('be.oneOf', [200, 304])
    // The list should cointain 4 photos
    cy.get('.photos > a').should('have.length', 4)

  })

  it('open photo', () => {
    // Select rover and camera
    cy.get('.rover-select').select('curiosity')
    cy.wait(1000)
    cy.get('.camera-select').select('CHEMCAM')
    // Click photo
    cy.get('.photos > a:first-child').click()
    // Check that the container is populated
    cy.get('.photo-container').children().should('have.length', 1)
  })

})