describe('Dashboard por rol', () => {
  it('muestra panel institucional para ADMIN', () => {
    cy.loginAsAdmin();
    cy.get('[data-cy="admin-dashboard"]').should('be.visible');
    cy.get('[data-cy="admin-dashboard"]').should('contain.text', 'Panel ejecutivo institucional');
    cy.get('[data-cy="admin-sidebar"]').should('be.visible');
  });

  it('muestra panel docente para TEACHER', () => {
    cy.loginAsTeacher();
    cy.get('[data-cy="admin-dashboard"]').should('be.visible');
    cy.get('[data-cy="admin-dashboard"]').should('contain.text', 'Panel ejecutivo docente');
  });

  it('muestra portal padre y oculta módulos administrativos', () => {
    cy.loginAsParent();
    cy.get('[data-cy="admin-dashboard"]').should('be.visible');
    cy.get('[data-cy="admin-dashboard"]').should('contain.text', 'Panel ejecutivo padre de familia');
    cy.get('[data-cy="admin-sidebar"]').should('not.contain', 'Usuarios');
    cy.get('[data-cy="admin-sidebar"]').should('not.contain', 'Ventas');
  });
});
