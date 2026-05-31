describe('Web pública', () => {
  it('carga la página de inicio y navega a contacto', () => {
    cy.visit('/');
    cy.get('[data-cy="public-navbar"]').should('be.visible');
    cy.get('body').should('contain.text', 'HORIZONTE');
    cy.get('[data-cy="nav-contact"]').click();
    cy.url().should('include', '/contacto');
    cy.get('[data-cy="contact-form"]').should('be.visible');
  });

  it('navega al login desde la navbar', () => {
    cy.visit('/');
    cy.get('[data-cy="nav-login"]').click();
    cy.url().should('include', '/login');
    cy.get('[data-cy="login-form"]').should('be.visible');
  });
});
