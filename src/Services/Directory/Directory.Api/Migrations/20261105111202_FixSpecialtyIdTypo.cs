using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Directory.Api.Migrations
{
    /// <inheritdoc />
    public partial class FixSpecialtyIdTypo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Doctors_Specialties_SpeciltyId",
                table: "Doctors");

            migrationBuilder.DropForeignKey(
                name: "FK_ExaminationTypes_Specialties_SpecilatyId",
                table: "ExaminationTypes");

            migrationBuilder.RenameColumn(
                name: "SpecilatyId",
                table: "ExaminationTypes",
                newName: "SpecialtyId");

            migrationBuilder.RenameColumn(
                name: "Desctiption",
                table: "ExaminationTypes",
                newName: "Description");

            migrationBuilder.RenameIndex(
                name: "IX_ExaminationTypes_SpecilatyId",
                table: "ExaminationTypes",
                newName: "IX_ExaminationTypes_SpecialtyId");

            migrationBuilder.RenameColumn(
                name: "SpeciltyId",
                table: "Doctors",
                newName: "SpecialtyId");

            migrationBuilder.RenameIndex(
                name: "IX_Doctors_SpeciltyId",
                table: "Doctors",
                newName: "IX_Doctors_SpecialtyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Doctors_Specialties_SpecialtyId",
                table: "Doctors",
                column: "SpecialtyId",
                principalTable: "Specialties",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ExaminationTypes_Specialties_SpecialtyId",
                table: "ExaminationTypes",
                column: "SpecialtyId",
                principalTable: "Specialties",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Doctors_Specialties_SpecialtyId",
                table: "Doctors");

            migrationBuilder.DropForeignKey(
                name: "FK_ExaminationTypes_Specialties_SpecialtyId",
                table: "ExaminationTypes");

            migrationBuilder.RenameColumn(
                name: "SpecialtyId",
                table: "ExaminationTypes",
                newName: "SpecilatyId");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "ExaminationTypes",
                newName: "Desctiption");

            migrationBuilder.RenameIndex(
                name: "IX_ExaminationTypes_SpecialtyId",
                table: "ExaminationTypes",
                newName: "IX_ExaminationTypes_SpecilatyId");

            migrationBuilder.RenameColumn(
                name: "SpecialtyId",
                table: "Doctors",
                newName: "SpeciltyId");

            migrationBuilder.RenameIndex(
                name: "IX_Doctors_SpecialtyId",
                table: "Doctors",
                newName: "IX_Doctors_SpeciltyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Doctors_Specialties_SpeciltyId",
                table: "Doctors",
                column: "SpeciltyId",
                principalTable: "Specialties",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ExaminationTypes_Specialties_SpecilatyId",
                table: "ExaminationTypes",
                column: "SpecilatyId",
                principalTable: "Specialties",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
