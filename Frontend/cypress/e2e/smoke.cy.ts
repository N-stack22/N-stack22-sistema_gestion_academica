describe('Smoke test de la app', () => {
  it('carga la aplicación Angular actual', () => {
    cy.visit('/');
    cy.get('[data-cy="public-navbar"]').should('be.visible');
    cy.get('body').should('contain.text', 'HORIZONTE');
  });

  it('carga la página de login con formulario actual', () => {
    cy.visit('/login');
    cy.get('[data-cy="login-form"]').should('be.visible');
    cy.get('[data-cy="login-email"]').should('be.visible');
    cy.get('[data-cy="login-password"]').should('be.visible');
  });
});
