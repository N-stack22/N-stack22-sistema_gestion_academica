describe('Autenticación mock', () => {
  it('redirige al login si intenta entrar al dashboard sin sesión', () => {
    cy.visit('/admin/dashboard');
    cy.url({ timeout: 10000 }).should('include', '/login');
    cy.get('[data-cy="login-form"]').should('be.visible');
  });

  it('muestra error con credenciales incorrectas', () => {
    cy.visit('/login');
    cy.get('[data-cy="login-form"]').should('be.visible');
    cy.get('[data-cy="login-email"]').type('error@horizonte.edu.pe');
    cy.get('[data-cy="login-password"]').type('incorrecta');
    cy.get('[data-cy="login-submit"]').click();
    cy.get('[data-cy="login-error"]').should('be.visible');
  });

  it('permite iniciar sesión como ADMIN y cerrar sesión', () => {
    cy.loginAsAdmin();
    cy.url().should('include', '/admin/dashboard');
    cy.get('[data-cy="admin-dashboard"]').should('be.visible');
    cy.get('[data-cy="logout-button"]').click();
    cy.url().should('include', '/login');
  });
});
