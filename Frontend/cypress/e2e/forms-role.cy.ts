describe('Visibilidad de formularios por rol', () => {
  it('ADMIN puede ver formulario de estudiantes', () => {
    cy.loginAsAdmin();
    cy.visit('/admin/estudiantes');
    cy.get('[data-cy="student-form"]').should('be.visible');
  });

  it('TEACHER no ve formulario de estudiantes pero sí tareas', () => {
    cy.loginAsTeacher();
    cy.visit('/admin/estudiantes');
    cy.get('[data-cy="student-form"]').should('not.exist');

    cy.visit('/admin/tareas');
    cy.get('[data-cy="task-form"]').should('be.visible');
  });

  it('PARENT no ve formularios administrativos', () => {
    cy.loginAsParent();
    cy.visit('/admin/tareas');
    cy.get('[data-cy="task-form"]').should('not.exist');
  });
});
